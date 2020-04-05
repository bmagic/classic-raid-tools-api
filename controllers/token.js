const { RefreshToken, User } = require('../models')
const { generateJWT, generateRefreshToken, validateJWT } = require('../lib/jwt')

async function refreshToken (ctx) {
  if (ctx.request.body && ctx.request.body.refreshToken) {
    let refreshToken = await RefreshToken.findOne({ value: ctx.request.body.refreshToken })
    if (refreshToken === null) {
      ctx.throw(401)
    } else {
      const user = await User.findOne({ _id: refreshToken.userId })
      const token = generateJWT({ id: user._id, roles: user.roles })

      try {
        await validateJWT(refreshToken.value, '1 sec')
        ctx.ok({ token: token, refreshToken: refreshToken.value })
      } catch (e) {
        refreshToken = await generateRefreshToken(user._id)
        ctx.ok({ token: token, refreshToken: refreshToken })
      }
    }
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  refreshToken
}
