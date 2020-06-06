const { Enchant } = require('../models')
const moment = require('moment')
async function getEnchants (ctx) {
  // const result = await Enchant.find({ date: ctx.params.date, instance: ctx.params.instance }, { _id: 0, wid: 1, enchantId: 1, name: 1, slot: 1 }).sort({ name: 1 })
  const result = await Enchant.aggregate([
    { $match: { date: moment(ctx.params.date).toDate(), instance: ctx.params.instance } },
    { $sort: { slot: 1 } },
    {
      $group: { _id: '$name', items: { $push: { wid: '$wid', slot: '$slot', enchantId: '$enchantId' } } }
    },

    { $sort: { _id: 1 } }

  ])
  ctx.ok(result)
}

async function getEnchantsRaids (ctx) {
  const result = await Enchant.aggregate([

    {
      $group: { _id: '$date', instance: { $first: '$instance' } }
    },

    { $sort: { _id: -1 } }

  ])
  ctx.ok(result)
}

module.exports = {
  getEnchants,
  getEnchantsRaids
}
