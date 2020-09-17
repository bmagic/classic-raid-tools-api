const { Raid, Registration, RegistrationLog, Character, User } = require('../models')
const moment = require('moment')
const mongoose = require('mongoose')
const { sendMessage } = require('../lib/discordWebhook')

async function getRaids (ctx) {
  const raids = await Raid.find().sort({ date: -1 })
  ctx.ok(raids)
}

async function getNextRaids (ctx) {
  if (!ctx.user) ctx.throw(401)
  const before = new Date()
  before.setTime(before.getTime() - 12 * 60 * 60 * 1000)
  const raids = await Raid.find({ date: { $gt: before } }).sort('date')
  const result = []
  for (const index in raids) {
    const raid = raids[index]
    let registered = false
    const playersCount = []
    const registrations = await Registration.find({ raidId: raid._id }).limit(999)
    for (const index in registrations) {
      const registration = registrations[index]
      if (registration.userId.toString() === ctx.user.id.toString()) registered = true
      const character = await Character.findOne({ _id: registration.characterId })
      if (!playersCount.includes(registration.userId.toString()) && (registration.status === 'ok' || registration.status === 'bench') && character !== null) playersCount.push(registration.userId.toString())
    }
    result.push({ _id: raid._id, title: raid.title, date: raid.date, instance: raid.instance, main: raid.main, registered: registered, playersCount: playersCount.length })
  }
  ctx.ok(result)
}

async function createRaid (ctx) {
  if (ctx.request.body && ctx.request.body.date && ctx.request.body.instance) {
    const raid = await new Raid({ date: new Date(ctx.request.body.date), instance: ctx.request.body.instance }).save()

    const content = `<@&678625612591530003> le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} vient d'être créé, vous pouvez vous inscrire : ${process.env.FRONT_URL}/raid/${raid._id}`
    await sendMessage('raid', content)

    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}
async function deleteRaid (ctx) {
  await Raid.deleteMany({ _id: ctx.params.id })
  await Registration.deleteMany({ raidId: ctx.params.id })
  await RegistrationLog.deleteMany({ raidId: ctx.params.id })
  ctx.noContent()
}

async function getRaid (ctx) {
  if (ctx.params && ctx.params.id) {
    if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) ctx.throw(404)
    const raid = await Raid.findOne({ _id: ctx.params.id })
    if (raid === null) ctx.throw(404)
    ctx.ok(raid)
  } else {
    ctx.throw(400)
  }
}

async function updateRaid (ctx) {
  await Raid.updateOne({ _id: ctx.params.id }, ctx.request.body)
  try {
    ctx.app.io.to(ctx.params.id).emit('ACTION', {
      type: 'GET_RAID',
      id: ctx.params.id
    })
  } catch (e) {
    console.error(e)
  }
  ctx.noContent()
}

async function createRegistration (ctx) {
  if (ctx.request.body && ctx.request.body.raidId && ctx.request.body.characterId) {
    const status = ctx.request.body.status || undefined
    const favorite = ctx.request.body.favorite || false
    const character = await Character.findOne({ _id: ctx.request.body.characterId })
    const validated = ctx.request.body.validated || false

    if (character === null) ctx.throw(400)

    const raid = await Raid.findOne({ _id: ctx.request.body.raidId })
    if (raid === null || moment(raid.date).isBefore(moment()))ctx.throw(400)
    const registration = await Registration.findOne({ userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId }).populate('raidId')
    if (registration !== null) {
      if (moment(registration.raidId.date).subtract(1, 'day').isBefore(moment()) && (status === 'ko' || status === 'late') && raid.main === true) {
        const content = `<@&678898787909107722> ${character.name} vient de changer la dispo de ${registration.status === 'bench' ? 'repos' : registration.status} à ${status} moins de 24h avant le raid ${registration.raidId.instance} ${process.env.FRONT_URL}/raid/${registration.raidId._id}`
        await sendMessage('admin', content)
      }
      registration.status = status
      registration.favorite = favorite
      registration.date = new Date()
      registration.save()
    } else {
      await new Registration({ date: new Date(), userId: ctx.user.id, raidId: ctx.request.body.raidId, characterId: ctx.request.body.characterId, status: status, favorite: favorite }).save()
    }

    await new RegistrationLog({ date: new Date(), raidId: ctx.request.body.raidId, characterName: character.name, status: status, favorite: favorite, validated: validated, userId: ctx.user.id }).save()

    try {
      ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', {
        type: 'GET_REGISTRATIONS',
        raidId: ctx.request.body.raidId
      })

      ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', {
        type: 'GET_REGISTRATION_LOGS',
        raidId: ctx.request.body.raidId
      })

      ctx.app.io.to(ctx.request.body.raidId).emit('ACTION', {
        type: 'GET_MISSING_REGISTRATIONS',
        raidId: ctx.request.body.raidId
      })
    } catch (e) {
      console.error(e)
    }

    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}

async function updateRegistration (ctx) {
  const registration = await Registration.findOne({ _id: ctx.params.id }).populate('characterId')
  if (registration === null) {
    ctx.throw(400)
  }

  registration.validated = ctx.request.body.validated
  await registration.save()

  await new RegistrationLog({ date: new Date(), raidId: registration.raidId, characterName: registration.characterId.name, status: registration.status, favorite: registration.favorite, validated: registration.validated, userId: ctx.user.id }).save()

  try {
    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_REGISTRATIONS',
      raidId: registration.raidId
    })

    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_REGISTRATION_LOGS',
      raidId: registration.raidId
    })

    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_MISSING_REGISTRATIONS',
      raidId: registration.raidId
    })
  } catch (e) {
    console.error(e)
  }

  ctx.noContent()
}

async function deleteRegistration (ctx) {
  const registration = await Registration.findOne({ _id: ctx.params.id }).populate('characterId')

  await Registration.deleteOne({ _id: ctx.params.id })
  await new RegistrationLog({ date: new Date(), raidId: registration.raidId, characterName: registration.characterId.name, status: 'delete', favorite: registration.favorite, validated: registration.validated, userId: ctx.user.id }).save()

  try {
    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_REGISTRATIONS',
      raidId: registration.raidId
    })

    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_REGISTRATION_LOGS',
      raidId: registration.raidId
    })

    ctx.app.io.to(registration.raidId).emit('ACTION', {
      type: 'GET_MISSING_REGISTRATIONS',
      raidId: registration.raidId
    })
  } catch (e) {
    console.error(e)
  }

  ctx.noContent()
}

async function getRegistrations (ctx) {
  if (ctx.params && ctx.params.id) {
    if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) ctx.throw(404)

    const result = []
    const registrations = await Registration.find({ raidId: ctx.params.id }).sort('date')
    for (const index in registrations) {
      const registration = registrations[index]
      const character = await Character.findOne({ _id: registration.characterId }).populate('userId')
      if (character !== null && character.userId !== null) {
        result.push({ _id: registration._id, characterId: character._id, name: character.name, spec: character.spec, class: character.class, main: character.main || false, userId: character.userId._id, username: character.userId.username, roles: character.userId.roles || [], status: registration.status, favorite: registration.favorite || false, validated: registration.validated || false })
      }
    }
    ctx.ok(result)
  } else {
    ctx.throw(400)
  }
}

async function getRegistrationLogs (ctx) {
  if (ctx.params && ctx.params.id) {
    const registrationLogs = await RegistrationLog.find({ raidId: ctx.params.id }).populate('userId').sort({ date: -1 })
    ctx.ok(registrationLogs)
  } else {
    ctx.throw(400)
  }
}

async function missingRegistrations (ctx) {
  const registrations = await Registration.find({ raidId: ctx.params.id })
  const missingUsers = []
  const users = await User.find({ $or: [{ roles: 'member' }, { roles: 'apply' }] })

  for (const user of users) {
    let isRegistered = false
    for (const registration of registrations) {
      if (registration.userId.toString() === user._id.toString() && registration.status) { isRegistered = true }
    }
    if (!isRegistered) missingUsers.push(user.username)
  }
  ctx.ok(missingUsers)
}

module.exports = {
  getRaids,
  getNextRaids,
  createRaid,
  deleteRaid,
  getRaid,
  updateRaid,
  createRegistration,
  updateRegistration,
  getRegistrations,
  getRegistrationLogs,
  missingRegistrations,
  deleteRegistration
}
