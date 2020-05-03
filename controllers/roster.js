const { Character, User } = require('../models')
async function getCharacters (ctx) {
  const characters = await Character.find().sort('name')
  const result = []
  for (const index in characters) {
    const character = characters[index]
    const user = await User.findOne({ _id: character.userId })
    if (user && user.roles.includes('member')) {
      result.push({ _id: character._id, userId: character.userId, name: character.name, spec: character.spec, class: character.class, username: user.username, main: character.main })
    }
  }
  ctx.ok(result)
}

module.exports = {
  getCharacters
}
