const { Presence, User } = require('../models')

async function getPresences (ctx) {
  const filter = {}

  if (ctx.request.query.instance) { filter.instance = ctx.request.query.instance }
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
