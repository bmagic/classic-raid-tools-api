const { Item } = require('../models')
const mongoose = require('mongoose')

async function getCharacterItems (ctx) {
  const result = await Item.aggregate([
    { $match: { characterId: mongoose.Types.ObjectId(ctx.params.id) } },
    { $sort: { date: -1 } },
    {
      $group: { _id: '$wid', slot: { $first: '$slot' }, date: { $first: '$date' }, encounters: { $push: { boss: '$boss', zone: '$zone', date: '$date' } } }
    },
    { $sort: { date: -1 } }
  ])
  ctx.ok(result)
}

module.exports = {
  getCharacterItems
}
