const { Availability } = require('../models')

async function getAvailabilities (ctx) {
  const availability = await Availability.findOne({ userId: ctx.user.id })
  ctx.ok(availability)
}

async function getAllAvailabilities (ctx) {
  const result = await Availability.find().populate('userId')
  ctx.ok(result)
}

async function putAvailabilities (ctx) {
  if (ctx.request.body && ctx.request.body.day && ctx.request.body.status) {
    const availability = await Availability.findOne({ userId: ctx.user.id })
    if (availability === null) {
      const object = { userId: ctx.user.id }
      object[ctx.request.body.day] = ctx.request.body.status
      await new Availability(object).save()
    } else {
      availability[ctx.request.body.day] = ctx.request.body.status
      availability.save()
    }

    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}

module.exports = {
  getAvailabilities,
  getAllAvailabilities,
  putAvailabilities
}
