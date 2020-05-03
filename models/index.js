const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, index: { unique: true }, required: true },
  email: { type: String, index: { unique: true }, required: true },
  discordId: { type: String },
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
  userId: { type: mongoose.ObjectId, required: true },
  spec: { type: String, required: true },
  class: { type: String, required: true },
  main: { type: Boolean, default: false }
})
const Character = mongoose.model('Character', characterSchema)

const raidSchema = new mongoose.Schema({
  date: { type: Date, index: true, required: true },
  name: { type: String },
  instance: { type: String, required: true },
  title: { type: String, default: '' },
  logs: { type: String, default: '' },
  gdoc: { type: String, default: '' },
  infos: { type: String, default: '' },
  main: { type: Boolean, default: false }
})
const Raid = mongoose.model('Raid', raidSchema)

const registration = new mongoose.Schema({
  date: { type: Date, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  favorite: { type: Boolean },
  status: { type: String }
})

const Registration = mongoose.model('Registration', registration)

const registrationLog = new mongoose.Schema({
  date: { type: Date, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true },
  characterName: { type: String, required: true },
  status: { type: String },
  favorite: { type: Boolean }
})
const RegistrationLog = mongoose.model('RegistrationLog', registrationLog)

module.exports = {
  Item,
  Character,
  User,
  Raid,
  Registration,
  RegistrationLog
}
