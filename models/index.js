const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  discordId: { type: String, index: { unique: true }, required: true },
  roles: [{ type: String }],
  mdc: { type: String }
})
const User = mongoose.model('User', userSchema)

const presenceSchema = new mongoose.Schema({
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' },
  characterId: { type: mongoose.ObjectId, ref: 'Character' },
  instance: { type: String, index: true, required: true },
  status: { type: String, required: true },
  reportId: { type: String, required: true },
  date: { type: Date, required: true }
})
const Presence = mongoose.model('Presence', presenceSchema)

const itemSchema = new mongoose.Schema({
  wid: { type: Number, index: true, required: true },
  enchantId: { type: Number, index: true },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  firstDate: { type: Date, required: true, index: true },
  lastDate: { type: Date, required: true, index: true },
  slot: { type: String, required: true, index: true }
}, { toJSON: { virtuals: true } })

itemSchema.virtual('loot', {
  ref: 'Loot',
  localField: 'wid',
  foreignField: 'wid',
  justOne: true
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
  reroll: { type: Boolean, default: false },
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

const registrationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Raid' },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  validated: { type: Boolean, default: false },
  favorite: { type: Boolean },
  status: { type: String }
})

const enchantSchema = new mongoose.Schema({
  date: { type: Date, index: true, required: true },
  instance: { type: String, index: true, required: true },
  enchantId: { type: Number, required: true },
  wid: { type: Number, required: true },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  slot: { type: String, required: true }
})

const Enchant = mongoose.model('Enchant', enchantSchema)

const buffSchema = new mongoose.Schema({
  date: { type: Date, index: true, required: true },
  instance: { type: String, index: true, required: true },
  wid: { type: Number, required: true },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' }
})

const Buff = mongoose.model('Buff', buffSchema)

const professionRecipe = new mongoose.Schema({
  characterName: { type: String, index: true, required: true },
  wid: { type: Number, index: true, required: true },
  profession: { type: String, index: true, required: true }
})
const ProfessionRecipe = mongoose.model('ProfessionRecipe', professionRecipe)
const attendanceSchema = new mongoose.Schema({
  character: { type: String },
  status: { type: String, required: true },
  buffsCount: { type: Number, required: true },
  reportId: { type: String, required: true },
  date: { type: Date, required: true },
  zone: { type: Number, required: true }
})
const Attendance = mongoose.model('Attendance', attendanceSchema)

module.exports = {
  Item,
  Character,
  User,
  BankItem,
  BankItemRequest,
  BankItemLog,
  Presence,
  Enchant,
  Buff,
  ProfessionRecipe,
  Attendance
}
