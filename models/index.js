const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.ObjectId, required: true },
  value: { type: String, index: true, required: true },
  date: { type: Date, index: { expires: '48h' }, required: true }
})
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)

const userSchema = new mongoose.Schema({
  email: { type: String, index: { unique: true }, required: true },
  discordId: { type: Number, index: { unique: true } },
  githubId: { type: Number, index: { unique: true } },
  roles: [{ type: String }]
})
const User = mongoose.model('User', userSchema)

const itemSchema = new mongoose.Schema({
  wid: { type: Number, index: true, required: true },
  character: { type: String, index: true, required: true },
  date: { type: Date, required: true },
  slot: { type: String, enum: ['head', 'neck', 'shoulder', 'chest', 'waist', 'legs', 'feet', 'wrist', 'hands', 'finger', 'trinket', 'back', 'mainHand', 'offHand', 'ranged'], required: true, index: true }
})
const Item = mongoose.model('Item', itemSchema)

const characterSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  userId: { type: mongoose.ObjectId },
  spec: { type: String },
  class: { type: String }
})
const Character = mongoose.model('Character', characterSchema)

const raidSchema = new mongoose.Schema({
  date: { type: Date, index: true, required: true },
  name: { type: String },
  instance: { type: String, required: true }
})
const Raid = mongoose.model('Raid', raidSchema)

module.exports = {
  RefreshToken,
  Item,
  Character,
  User,
  Raid
}
