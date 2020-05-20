const { Presence: Presences } = require('../models')

async function getPresences (ctx) {
  const filter = {}

  if (ctx.request.query.instance) { filter.instance = ctx.request.query.instance }
  const result = await Presences.find(filter).sort({ date: -1 }).populate('userId').populate('characterId').exec()
  ctx.ok(result)
}

module.exports = {
  getPresences
}
