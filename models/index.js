const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  discordId: { type: String, index: { unique: true }, required: true },
  roles: [{ type: String }]
})
const User = mongoose.model('User', userSchema)

const presenceSchema = new mongoose.Schema({
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  instance: { type: String, index: true, required: true },
  status: { type: String, required: true },
  reportId: { type: String, required: true },
  date: { type: Date, required: true }
})
const Presence = mongoose.model('Presence', presenceSchema)

const itemSchema = new mongoose.Schema({
  wid: { type: Number, index: true, required: true },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  date: { type: Date, required: true },
  slot: { type: String, enum: ['head', 'neck', 'shoulder', 'chest', 'waist', 'legs', 'feet', 'wrist', 'hands', 'finger', 'trinket', 'back', 'mainHand', 'offHand', 'ranged'], required: true, index: true }
})
const Item = mongoose.model('Item', itemSchema)

const bankItemSchema = new mongoose.Schema({
  wid: { type: Number, index: true, required: true },
  character: { type: String, index: true, required: true },
  quantity: { type: Number, required: true },
  category: { type: String },
  subCategory: { type: String },
  marketValue: { type: Number },
  freeForMembers: { type: Boolean, required: true, default: false }
})
const BankItem = mongoose.model('BankItem', bankItemSchema)

const bankItemLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  wid: { type: Number, index: true, required: true },
  character: { type: String, index: true, required: true },
  prevQuantity: { type: Number, required: true },
  quantity: { type: Number, required: true }
})
const BankItemLog = mongoose.model('BankItemLog', bankItemLogSchema)

const bankItemRequestSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  items: { type: Object, required: true },
  userId: { type: mongoose.ObjectId, required: true, ref: 'User' },
  status: { type: String, default: 'asked' },
  message: { type: String, required: true }
})
const BankItemRequest = mongoose.model('BankItemRequest', bankItemRequestSchema)

const characterSchema = new mongoose.Schema({
  name: { type: String, index: { unique: true }, required: true },
  userId: { type: mongoose.ObjectId, required: true, ref: 'User' },
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
  validated: { type: Boolean, default: false },
  favorite: { type: Boolean },
  status: { type: String }
})

const Registration = mongoose.model('Registration', registration)

const registrationLog = new mongoose.Schema({
  date: { type: Date, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true },
  characterName: { type: String, required: true },
  status: { type: String },
  favorite: { type: Boolean },
  validated: { type: Boolean, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' }
})
const RegistrationLog = mongoose.model('RegistrationLog', registrationLog)

module.exports = {
  Item,
  Character,
  User,
  Raid,
  Registration,
  RegistrationLog,
  BankItem,
  BankItemRequest,
  BankItemLog,
  Presence
}
