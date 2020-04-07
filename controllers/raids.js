const { Raid, Registration, Character } = require('../models')
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

async function createRegistration (ctx) {
  if (ctx.request.body && ctx.request.body.raidId && ctx.request.body.characterId, ctx.request.body.status) {
    const registration = await Registration.findOne({ userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId })
    if (registration !== null) {
      registration.status = ctx.request.body.status
      registration.date = new Date()
      registration.save()
    } else {
      await new Registration({ date: new Date(), userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId, status: ctx.request.body.status }).save()
    }
    ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', { // Emits a status message to the connect room when a socket client is connected
      type: 'GET_REGISTRATIONS',
      raidId: ctx.request.body.raidId
    })
    ctx.ok(204)
  } else {
    ctx.throw(400)
  }
}

async function getRegistrations (ctx) {
  if (ctx.params && ctx.params.id) {
    const result = []
    const registrations = await Registration.find({ raidId: ctx.params.id })
    for (const index in registrations) {
      const registration = registrations[index]
      const character = await Character.findOne({ _id: registration.characterId })
      result.push({ characterId: character._id, name: character.name, spec: character.spec, class: character.class, userId: character.userId, status: registration.status })
    }
    console.log(result)
    ctx.ok(result)
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getNextRaids,
  createRaid,
  getRaid,
  createRegistration,
  getRegistrations
}
