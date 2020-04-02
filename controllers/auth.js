const { validateJWT } = require('../lib/jwt')
async function authenticate (ctx, next, role) {
  if (ctx.headers.authorization) {
    const token = ctx.headers.authorization.split(' ')[1]

    try {
      const data = validateJWT(token)
      ctx.user = data

      if (role && data.roles && !data.roles.includes(role)) {
        ctx.throw(401)
      }

      return next()
    } catch (e) {
      ctx.throw(401, `JWT error : ${e.message}`)
    }
  }
  ctx.throw(401)
}

module.exports = {
  authenticate
}
