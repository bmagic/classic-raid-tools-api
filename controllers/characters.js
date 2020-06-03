const { Character } = require('../models')

async function getCharacter (ctx) {
  const character = await Character.findOne({ name: ctx.params.name })
  if (character === null) {
    ctx.notFound()
  } else {
    ctx.ok(character)
  }
}

module.exports = {
  getCharacter
}
