const fetch = require('node-fetch')
const { generateJWT } = require('../lib/jwt')

const { User } = require('../models')

async function auth (ctx) {
  const accessCode = ctx.request.query.code

  /** Get Oauth Tokens from Github **/
  const oAuthTokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: accessCode
    })
  })

  if (oAuthTokenResponse.status !== 200) {
    ctx.throw(oAuthTokenResponse.status, `Github return "${oAuthTokenResponse.statusText}" on token request`)
  }
  const oAuthTokenJson = await oAuthTokenResponse.json()

  /** Get User from Github **/
  const githubUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      authorization: `token ${oAuthTokenJson.access_token}`
    }
  })
  if (githubUserResponse.status !== 200) {
    ctx.throw(githubUserResponse.status, `Github return "${githubUserResponse.statusText}" on user request`)
  }
  const githubUserJson = await githubUserResponse.json()

  if (githubUserJson.id === undefined) {
    ctx.throw(400, 'Github return an empty user id')
  }

  /** Insert user in DB if new **/
  let user = await User.findOne({ githubId: githubUserJson.id })
  if (user === null) {
    const githubUserEmailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        authorization: `token ${oAuthTokenJson.access_token}`
      }
    })
    if (githubUserEmailsResponse.status !== 200) {
      ctx.throw(githubUserEmailsResponse.status, `Github return "${githubUserEmailsResponse.statusText}" on user emails request`)
    }
    const githubEmailsUserJson = await githubUserEmailsResponse.json()

    let githubEmail = null
    for (const index in githubEmailsUserJson) {
      if (githubEmailsUserJson[index].primary) { githubEmail = githubEmailsUserJson[index].email }
    }

    if (githubEmail === null) {
      ctx.throw(400, 'Github return an empty email')
    }

    user = await User.findOne({ email: githubEmail })
    if (user === null) {
      user = await new User({ email: githubEmail, githubId: githubUserJson.id }).save()
    } else {
      user.githubId = githubUserJson.id
      await user.save()
    }
  }

  /** Generate JWT **/
  const token = generateJWT({ id: user._id, roles: user.roles })

  ctx.ok({ token: token })
}

module.exports = {
  auth
}
