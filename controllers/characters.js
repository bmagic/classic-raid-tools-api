const { Character } = require('../models')

async function getCharacters (ctx) {
  const characters = await Character.find()

  ctx.ok(characters)
}

module.exports = {
  getCharacters
}
