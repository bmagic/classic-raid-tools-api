const { validateJWT } = require('../lib/jwt')
const { User } = require('../models')

async function authenticate (ctx, next, roles) {
  if (ctx.cookies.get('token')) {
    const token = ctx.cookies.get('token')

    try {
      const data = validateJWT(token)

      const user = await User.findOne({ _id: data.id })

      if (user === null) { ctx.throw(401) }

      ctx.user = user

      if (roles && user.roles) {
        let access = false
        for (const index in user.roles) {
          const role = user.roles[index]
          if (roles.includes(role)) access = true
        }

        if (!access) {
          ctx.throw(401)
        }
      }

      return next()
    } catch (e) {
      ctx.throw(401, `JWT error : ${e.message}`)
    }
  }
  return next()
}

module.exports = {
  authenticate
}

