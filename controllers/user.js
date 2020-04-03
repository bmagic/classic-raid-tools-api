const { User } = require('../models')

async function getUser (ctx) {
  const user = await User.findOne({ _id: ctx.user.id })
  ctx.ok(user)
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
  getTalks,
  createTalk,
  deleteTalk
}
