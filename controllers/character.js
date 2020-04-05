const { Character } = require('../models')

async function getUserCharacters (ctx) {
  const characters = await Character.find({ userId: ctx.request.query.id })

  ctx.ok(characters)
}

module.exports = {
  getUserCharacters
}
