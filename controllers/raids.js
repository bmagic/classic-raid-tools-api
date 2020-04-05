const { Raid } = require('../models')

async function getNextRaids (ctx) {
  const before = new Date()
  before.setTime(before.getTime() - 12 * 60 * 60 * 1000)
  const raids = await Raid.find({ date: { $gt: before } }).sort('date')
  ctx.ok(raids)
}

async function createRaid (ctx) {
  if (ctx.request.body && ctx.request.body.date && ctx.request.body.instance) {
    new Raid({ date: new Date(ctx.request.body.date), instance: ctx.request.body.instance }).save()
    ctx.ok(204)
  } else {
    ctx.throw(400)
  }
}

async function getRaid (ctx) {
  if (ctx.params && ctx.params.id) {
    const raid = await Raid.findOne({ _id: ctx.params.id })
    ctx.ok(raid)
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getNextRaids,
  createRaid,
  getRaid
}
