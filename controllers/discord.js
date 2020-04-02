const fetch = require('node-fetch')
const FormData = require('form-data')
const { generateJWT } = require('../lib/jwt')
const { User } = require('../models')

async function auth (ctx) {
  const accessCode = ctx.request.query.code

  /** Get Oauth Tokens from Discord **/
  const data = new FormData()
  data.append('client_id', process.env.DISCORD_CLIENT_ID)
  data.append('client_secret', process.env.DISCORD_CLIENT_SECRET)
  data.append('grant_type', 'authorization_code')
  data.append('redirect_uri', process.env.DISCORD_REDIRECT_URI)
  data.append('scope', 'email')
  data.append('code', accessCode)

  const oAuthTokenResponse = await fetch('https://discordapp.com/api/oauth2/token', {
    method: 'POST',
    body: data
  })

  if (oAuthTokenResponse.status !== 200) {
    ctx.throw(oAuthTokenResponse.status, `Discord return "${oAuthTokenResponse.statusText}" on token request`)
  }
  const oAuthTokenJson = await oAuthTokenResponse.json()

  /** Get User from Discord **/
  const discordUserResponse = await fetch('https://discordapp.com/api/users/@me', {
    headers: {
      authorization: `${oAuthTokenJson.token_type} ${oAuthTokenJson.access_token}`
    }
  })

  if (discordUserResponse.status !== 200) {
    ctx.throw(discordUserResponse.status, `Discord return "${discordUserResponse.statusText}" on user request`)
  }

  const discordUserJson = await discordUserResponse.json()
  if (discordUserJson.email === undefined || discordUserJson.id === undefined) {
    ctx.throw(400, 'Discord return an empty user email or id')
  }

  /** Insert user in DB if new **/
  let user = await User.findOne({ discordId: discordUserJson.id })
  if (user === null) {
    user = await User.findOne({ email: discordUserJson.email })
    if (user === null) {
      user = await new User({ email: discordUserJson.email, discordId: discordUserJson.id }).save()
    } else {
      user.discordId = discordUserJson.id
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
