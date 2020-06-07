const { Character } = require('../models')
async function getCharacters (ctx) {
  const main = ctx.request.query.main || true
  const roles = ctx.request.query.roles.split(',') || ['member']
  const characters = await Character.find({ main: main }).sort('name').populate({
    path: 'userId',
    match: { roles: { $in: roles } }
  })
  const result = []
  for (const character of characters) {
    if (character.userId) {
      result.push({
        _id: character._id,
        name: character.name,
        spec: character.spec,
        class: character.class,
        username: character.userId.username
      })
    }
  }
  ctx.ok(result)
}

module.exports = {
  getCharacters
}
