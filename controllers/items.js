const { Item } = require('../models')

async function getItems (ctx) {
  const filter = {}
  if (ctx.request.query.character) {
    filter.character = ctx.request.query.character
  }
  console.log(filter)
  const items = await Item.find(filter).sort({ date: -1 })
  ctx.ok(items)
}

async function addItem (ctx) {
  const { wid, character, date, slot } = ctx.request.body
  if (wid !== 0) {
    const item = await Item.findOne({ wid: wid, character: character, slot: slot })
    if (item === null) {
      await new Item({ wid: wid, character: character, slot: slot, date: date }).save()
    } else {
      if (item.date.getTime() < date) {
        item.date = date
        item.save()
      }
    }
  }
  ctx.ok(204)
}

module.exports = {
  getItems,
  addItem
}
