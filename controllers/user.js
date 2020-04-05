const { User } = require('../models')
const { Character } = require('../models')

async function getUser (ctx) {
  const user = await User.findOne({ _id: ctx.user.id })
  ctx.ok(user)
}

async function getCharacters (ctx) {
  const characters = await Character.find({ userId: ctx.user.id }).sort('name')
  ctx.ok(characters)
}

async function createCharacter (ctx) {
  if (ctx.request.body && ctx.request.body.name && ctx.request.body.spec && ctx.request.body.class) {
    await new Character({ userId: ctx.user.id, name: ctx.request.body.name, spec: ctx.request.body.spec, class: ctx.request.body.class }).save()
    ctx.ok(204)
  } else {
    ctx.throw(400)
  }
}

async function deleteCharacter (ctx) {
  if (ctx.params && ctx.params.id) {
    const talk = await Character.findOne({ _id: ctx.params.id })
    if (talk.userId.toString() === ctx.user.id.toString()) {
      await Character.deleteOne({ _id: ctx.params.id })
      ctx.ok(204)
    } else {
      ctx.throw(403)
    }
  } else {
    ctx.throw(400)
  }
}

async function getUsers (ctx) {
  const users = await User.find()
  const usersResult = []
  for (const userIndex in users) {
    const user = users[userIndex]
    const characters = await Character.find({ userId: user._id })
    usersResult.push({ _id: user._id, email: user.email, roles: user.roles, characters: characters })
  }
  console.log(usersResult)
  ctx.ok(usersResult)
}

async function setRoles (ctx) {
  if (ctx.request.body && ctx.request.body.id && ctx.request.body.roles) {
    const user = await User.findOne({ _id: ctx.request.body.id })
    user.roles = ctx.request.body.roles
    user.save()
    ctx.ok(204)
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getUser,
  getCharacters,
  createCharacter,
  deleteCharacter,
  getUsers,
  setRoles
}
