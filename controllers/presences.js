const { Presence } = require('../models')

async function getPresences (ctx) {
  const filter = {}

  if (ctx.request.query.instance) { filter.instance = ctx.request.query.instance }
  const result = await Presence.find(filter).sort({ date: -1 }).populate('userId').populate('characterId').exec()
  ctx.ok(result)
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
