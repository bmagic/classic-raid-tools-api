const { User } = require('../models')
const { Character } = require('../models')

async function getUser (ctx) {
  if (ctx.user) { ctx.ok(ctx.user) } else { ctx.noContent() }
}

async function getCharacters (ctx) {
  if (ctx.user) {
    const characters = await Character.find({ userId: ctx.user.id }).sort('name')
    ctx.ok(characters)
  } else {
    ctx.throw(401)
  }
}

async function createCharacter (ctx) {
  if (ctx.request.body && ctx.request.body.name && ctx.request.body.spec && ctx.request.body.class) {
    await new Character({ userId: ctx.user.id, name: ctx.request.body.name, spec: ctx.request.body.spec, class: ctx.request.body.class }).save()
    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}

async function deleteCharacter (ctx) {
  if (ctx.params && ctx.params.id) {
    const talk = await Character.findOne({ _id: ctx.params.id })
    if (talk.userId.toString() === ctx.user.id.toString()) {
      await Character.deleteOne({ _id: ctx.params.id })
      ctx.noContent()
    } else {
      ctx.throw(403)
    }
  } else {
    ctx.throw(400)
  }
}

async function setMainCharacter (ctx) {
  const characters = await Character.find({ userId: ctx.user.id })
  for (const index in characters) {
    const character = characters[index]
    if (character._id.toString() === ctx.params.id) {
      character.main = true
    } else {
      character.main = false
    }
    character.save()
  }
  ctx.noContent()
}

async function getUsers (ctx) {
  const users = await User.find()
  const usersResult = []
  for (const userIndex in users) {
    const user = users[userIndex]
    const characters = await Character.find({ userId: user._id })
    usersResult.push({ _id: user._id, email: user.email, roles: user.roles, characters: characters, username: user.username })
  }
  ctx.ok(usersResult)
}
async function updateUser (ctx) {
  const user = ctx.user
  if (ctx.request.body.email === '' || ctx.request.body.username === '') { ctx.throw(400) }
  user.email = ctx.request.body.email
  user.username = ctx.request.body.username

  user.save()
  ctx.noContent()
}

async function setRoles (ctx) {
  if (ctx.request.body && ctx.request.body.id && ctx.request.body.roles) {
    const user = await User.findOne({ _id: ctx.request.body.id })
    user.roles = ctx.request.body.roles
    user.save()
    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}
async function logout (ctx) {
  ctx.cookies.set('token', null, {
    maxAge: 0
  })
  ctx.noContent()
}

module.exports = {
  getUser,
  getCharacters,
  createCharacter,
  deleteCharacter,
  setMainCharacter,
  getUsers,
  setRoles,
  updateUser,
  logout
}
