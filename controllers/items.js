const { Item, Character } = require('../models')

async function getCharacterItems (ctx) {
  const result = await Item.find({ characterId: ctx.params.id }).sort({ lastDate: -1 })
  ctx.ok(result)
}

async function getItems (ctx) {
  const spec = ctx.request.query.spec
  const wClass = ctx.request.query.class
  if (spec === undefined) ctx.throw(400)

  const filter = { main: true }
  if (wClass) filter.class = wClass
  if (spec && spec !== '') filter.spec = spec
  const characters = await Character.find(filter).sort({ spec: 1, class: 1, name: 1 }).populate('userId')

  const result = {}
  for (const character of characters) {
    if (character.userId.roles.includes('member')) {
      const items = await Item.find({ characterId: character._id }).sort({ lastDate: -1 })
      result[character.name] = items
    }
  }
  ctx.ok(result)
}


module.exports = {
  getCharacterItems,
  getItems
}
