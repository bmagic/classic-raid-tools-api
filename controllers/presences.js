const { Presence, User, InstanceStats } = require('../models')

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

async function getStats (ctx) {
  const result = await InstanceStats.find().populate('characterId', { name: 1, spec: 1, class: 1 }).sort({ 'stats.all': -1 })

  ctx.ok(result)
}

module.exports = {
  getPresences,
  createPresence,
  deletePresence,
  getStats
}
