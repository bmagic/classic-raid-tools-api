const { Enchant, Buff } = require('../models')
async function getDebrief (ctx) {
  const enchants = await Enchant.find({ date: ctx.params.date, instance: ctx.params.instance }).populate('characterId')
  const buffs = await Buff.find({ date: ctx.params.date, instance: ctx.params.instance }).populate('characterId')

  ctx.ok({ enchants: enchants, buffs: buffs })
}

async function getRaids (ctx) {
  const result = await Enchant.aggregate([

    {
      $group: { _id: '$date', instance: { $first: '$instance' } }
    },

    { $sort: { _id: -1 } }

  ])
  ctx.ok(result)
}

module.exports = {
  getDebrief,
  getRaids
}
