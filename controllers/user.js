const { User } = require('../models')
const crypto = require('crypto')
const { generateJWT } = require('../lib/jwt')
async function getUser (ctx) {
  const user = await User.findOne({ _id: ctx.user.id })
  ctx.ok(user)
}

async function register (ctx) {
  if (ctx.request.body && ctx.request.body.email && ctx.request.body.password) {
    let user = await User.findOne({ email: ctx.request.body.email })
    if (user !== null) {
      ctx.throw(409)
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const password = crypto.pbkdf2Sync(ctx.request.body.password, salt, 1000, 64, 'sha512').toString('hex')
    user = await new User({ email: ctx.request.body.email, password: password, salt: salt }).save()

    const token = generateJWT({ id: user._id, roles: user.roles })

    ctx.ok({ token: token })
  } else {
    ctx.throw(400)
  }
}
async function login (ctx) {
  if (ctx.request.body && ctx.request.body.email && ctx.request.body.password) {
    const user = await User.findOne({ email: ctx.request.body.email })

    if (user === null) {
      ctx.throw(403)
    }
    const password = crypto.pbkdf2Sync(ctx.request.body.password, user.salt, 1000, 64, 'sha512').toString('hex')

    if (user.password !== password) {
      ctx.throw(403)
    }

    const token = generateJWT({ id: user._id, roles: user.roles })

    ctx.ok({ token: token })
  } else {
    ctx.throw(400)
  }
}
const { Talk } = require('../models')

async function getTalks (ctx) {
  const talks = await Talk.find({ userId: ctx.user.id }).sort('name')
  ctx.ok(talks)
}

async function createTalk (ctx) {
  if (ctx.request.body && ctx.request.body.name) {
    await new Talk({ userId: ctx.user.id, name: ctx.request.body.name }).save()
    ctx.ok(204)
  } else {
    ctx.throw(400)
  }
}

async function deleteTalk (ctx) {
  if (ctx.params && ctx.params.id) {
    const talk = await Talk.findOne({ _id: ctx.params.id })
    if (talk.userId.toString() === ctx.user.id.toString()) {
      await Talk.deleteOne({ _id: ctx.params.id })
      ctx.ok(204)
    } else {
      ctx.throw(403)
    }
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getUser,
  register,
  login,
  getTalks,
  createTalk,
  deleteTalk
}
