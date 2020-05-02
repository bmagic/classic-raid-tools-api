const { Raid, Registration, RegistrationLog, Character } = require('../models')
async function getNextRaids (ctx) {
  const before = new Date()
  before.setTime(before.getTime() - 12 * 60 * 60 * 1000)
  const raids = await Raid.find({ date: { $gt: before } }).sort('date')
  const result = []
  for (const index in raids) {
    const raid = raids[index]

    const registration = await Registration.findOne({ userId: ctx.user.id, raidId: raid._id })
    let registered = false
    if (registration !== null) { registered = true }
    result.push({ _id: raid._id, date: raid.date, instance: raid.instance, registered: registered })
  }
  ctx.ok(result)
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

async function updateRaid (ctx) {
  await Raid.updateOne({ _id: ctx.params.id }, ctx.request.body)
  ctx.app.io.to(ctx.params.id).emit('ACTION', {
    type: 'GET_RAID',
    id: ctx.params.id
  })
  ctx.noContent()
}

async function createRegistration (ctx) {
  if (ctx.request.body && ctx.request.body.raidId && ctx.request.body.characterId) {
    const status = ctx.request.body.status || undefined
    const favorite = ctx.request.body.favorite || false
    const character = await Character.findOne({ _id: ctx.request.body.characterId })

    if (character === null) ctx.throw(400)

    const registration = await Registration.findOne({ userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId })
    if (registration !== null) {
      registration.status = status
      registration.favorite = favorite
      registration.date = new Date()
      registration.save()
    } else {
      await new Registration({ date: new Date(), userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId, status: status, favorite: favorite }).save()
    }

    await new RegistrationLog({ date: new Date(), raidId: ctx.request.body.raidId, characterName: character.name, status: status, favorite: favorite }).save()

    ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', {
      type: 'GET_REGISTRATIONS',
      raidId: ctx.request.body.raidId
    })

    ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', {
      type: 'GET_REGISTRATION_LOGS',
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
      if (character === null) {
        await Registration.deleteOne({ _id: registration._id })
      } else {
        result.push({ characterId: character._id, name: character.name, spec: character.spec, class: character.class, userId: character.userId, status: registration.status, favorite: registration.favorite })
      }
    }
    ctx.ok(result)
  } else {
    ctx.throw(400)
  }
}

async function getRegistrationLogs (ctx) {
  if (ctx.params && ctx.params.id) {
    const registrationLogs = await RegistrationLog.find({ raidId: ctx.params.id }).sort({ date: -1 }).limit(100)
    ctx.ok(registrationLogs)
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getNextRaids,
  createRaid,
  getRaid,
  updateRaid,
  createRegistration,
  getRegistrations,
  getRegistrationLogs
}
