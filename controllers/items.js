const { Item, Character } = require('../models')
const mongoose = require('mongoose')

async function getCharacterItems (ctx) {
  const result = await Item.aggregate([
    { $match: { characterId: mongoose.Types.ObjectId(ctx.params.id) } },
    { $sort: { date: -1 } },
    {
      $group: { _id: '$wid', slot: { $first: '$slot' }, date: { $first: '$date' }, encounters: { $sum: 1 } }
    },
    { $sort: { date: -1 } }
  ])
  ctx.ok(result)
}

async function getItems (ctx) {
  const spec = ctx.request.query.spec
  const wClass = ctx.request.query.class
  if (spec === undefined) ctx.throw(400)

  const filter = { spec: spec, main: true }
  if (wClass) filter.class = wClass
  const characters = await Character.find(filter).sort({ spec: 1, class: 1, name: 1 })

  const result = {}
  for (const character of characters) {
    const items = await Item.aggregate([
      { $match: { characterId: character._id } },
      { $sort: { date: -1 } },
      {
        $group: { _id: '$wid', slot: { $first: '$slot' }, date: { $first: '$date' } }
      },
      { $sort: { date: -1 } }
    ])
    result[character.name] = items
  }
  ctx.ok(result)
}

module.exports = {
  getCharacterItems,
  getItems
}
