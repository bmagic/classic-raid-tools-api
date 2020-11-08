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

const registrationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Raid' },
  characterId: { type: mongoose.ObjectId, index: true, required: true, ref: 'Character' },
  validated: { type: Boolean, default: false },
  favorite: { type: Boolean },
  status: { type: String }
})

const Registration = mongoose.model('Registration', registrationSchema)

const registrationLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  raidId: { type: mongoose.ObjectId, index: true, required: true },
  characterName: { type: String, required: true },
  status: { type: String },
  favorite: { type: Boolean },
  validated: { type: Boolean, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' }
})
const RegistrationLog = mongoose.model('RegistrationLog', registrationLogSchema)

const lootSchema = new mongoose.Schema({
  wid: { type: Number, index: { unique: true }, required: true },
  instance: { type: String, required: true },
  class: { type: String },
  subclass: { type: String },
  slot: { type: String },
  level: { type: Number },
  bosses: { type: Array, default: [] },
  mdcClassSpecs: { type: Object, default: {} },
  assignText: { type: String },
  globalText: { type: String }
})

const Loot = mongoose.model('Loot', lootSchema)

const lootNeedSchema = new mongoose.Schema({
  wid: { type: Number, index: true, required: true },
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' },
  type: { type: String }

})
const LootNeed = mongoose.model('LootNeed', lootNeedSchema)

const lootLogSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  log: { type: String, required: true },
  date: { type: Date, required: true }
})
const LootLog = mongoose.model('LootLog', lootLogSchema)

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

const availabilitySchema = new mongoose.Schema({
  monday: { type: String },
  tuesday: { type: String },
  wednesday: { type: String },
  thursday: { type: String },
  friday: { type: String },
  saturday: { type: String },
  sunday: { type: String },
  userId: { type: mongoose.ObjectId, index: true, required: true, ref: 'User' }
})

const Availability = mongoose.model('Availability', availabilitySchema)

const professionRecipe = new mongoose.Schema({
  characterName: { type: String, index: true, required: true },
  wid: { type: Number, index: true, required: true },
  profession: { type: String, index: true, required: true }
})
const ProfessionRecipe = mongoose.model('ProfessionRecipe', professionRecipe)

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
  Presence,
  Loot,
  LootNeed,
  LootLog,
  Enchant,
  Buff,
  Availability,
  ProfessionRecipe
}
