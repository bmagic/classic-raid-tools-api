const { Presence, User } = require('../models')

async function getPresences (ctx) {
  let filter = {}

  if (ctx.request.query.instance) {
    const instances = ctx.request.query.instance.split(' ')
    filter = { $or: [] }
    for (const instance of instances) {
      filter.$or.push({ instance: instance })
    }
  }
  const presences = await Presence.find(filter).sort({ date: -1 }).populate('userId', { _id: 1, username: 1, roles: 1 }).populate('characterId').exec()

  const users = await User.find({ $or: [{ roles: 'member' }, { roles: 'apply' }] }, { _id: 1, username: 1, roles: 1 })

  ctx.ok({ presences: presences, users: users })
}
async function createPresence (ctx) {
  await new Presence(ctx.request.body).save()
  ctx.noContent()
}

async function deletePresence (ctx) {
  await Presence.deleteOne({ _id: ctx.params.id }, ctx.request.body)
  ctx.noContent()
}

module.exports = {
  getPresences,
  createPresence,
  deletePresence
}
