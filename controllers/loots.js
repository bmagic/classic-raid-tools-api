const { Loot, LootLog, LootNeed } = require('../models')
const axios = require('axios')
const parser = require('fast-xml-parser')
const diff = require('deep-diff')

async function getWowheadInfos (loot) {
  const wowheadXmlInfos = await axios.get(`https://classic.wowhead.com/item=${loot.wid}&xml`)
  const wowheadJsonInfos = parser.parse(wowheadXmlInfos.data)

  loot.slot = wowheadJsonInfos.wowhead.item.inventorySlot
  loot.class = wowheadJsonInfos.wowhead.item.class
  loot.subclass = wowheadJsonInfos.wowhead.item.subclass
  loot.level = wowheadJsonInfos.wowhead.item.level
  return loot
}

async function createLoot (ctx) {
  let loot = ctx.request.body
  if (loot.wid === undefined) ctx.throw(400)
  loot = await getWowheadInfos(loot)
  await new Loot(loot).save()

  ctx.noContent()
}

async function updateLoot (ctx) {
  let loot = ctx.request.body
  if (loot.wid === undefined) ctx.throw(400)

  const originalLoot = await Loot.findOne({ _id: ctx.params.id })
  const originalLootJson = JSON.parse(JSON.stringify(originalLoot))
  delete originalLootJson.__v
  delete originalLootJson._id
  loot = await getWowheadInfos(loot)

  await new LootLog({ userName: ctx.user.username, log: `Update Item : ${JSON.stringify(diff(originalLootJson, ctx.request.body))}`, date: new Date() }).save()

  await Loot.updateOne({ _id: ctx.params.id }, loot)
  ctx.noContent()
}

async function deleteLoot (ctx) {
  await Loot.deleteOne({ _id: ctx.params.id })
  await new LootLog({ userName: ctx.user.username, log: `Delete item ${ctx.params.id}`, date: new Date() }).save()

  ctx.noContent()
}

async function getLoots (ctx) {
  const filter = { }

  if (ctx.request.query.class) { filter.arrayclass = ctx.request.query.class }
  if (ctx.request.query.instance) { filter.instance = ctx.request.query.instance }
  if (ctx.request.query.slot) { filter.slot = ctx.request.query.slot }
  if (ctx.request.query.whClass) { filter.class = ctx.request.query.whClass }
  if (ctx.request.query.whSubClass) { filter.subclass = ctx.request.query.whSubClass }
  if (ctx.request.query.classSpec) { filter[`mdcClassSpecs.${ctx.request.query.classSpec}`] = { $exists: true } }
  const result = await Loot.find(filter).sort({ wid: 1 })

  const resultClone = JSON.parse(JSON.stringify(result))
  for (const loot of resultClone) {
    const resultLootNeeds = await LootNeed.find({ wid: loot.wid }).populate('userId')
    loot.lootNeeds = resultLootNeeds
  }
  ctx.ok(resultClone)
}

async function setLootMdC (ctx) {
  if (ctx.user.mdc === '' || ctx.user.mdc === undefined) ctx.throw(401)

  const loot = await Loot.findOne({ _id: ctx.params.id })

  const mdcClassSpecs = JSON.parse(JSON.stringify(loot.mdcClassSpecs || {}))

  delete mdcClassSpecs[ctx.user.mdc]

  if (ctx.request.body.value !== '') {
    mdcClassSpecs[ctx.user.mdc] = ctx.request.body.value
  }
  loot.mdcClassSpecs = mdcClassSpecs
  await loot.save()

  await new LootLog({ userName: ctx.user.username, log: `UpdateMDC to : ${JSON.stringify(mdcClassSpecs)}`, date: new Date() }).save()

  ctx.noContent()
}

async function setAssignText (ctx) {
  if (ctx.user.mdc === '' || ctx.user.mdc === undefined) ctx.throw(401)
  const loot = await Loot.findOne({ _id: ctx.params.id })
  if (ctx.request.body.value !== '') {
    loot.assignText = ctx.request.body.value
  }
  await loot.save()

  ctx.noContent()
}
async function getLootLogs (ctx) {
  const result = await LootLog.find()
  ctx.ok(result)
}

async function createLootNeed (ctx) {
  const lootNeed = await LootNeed.findOne({ wid: ctx.request.body.wid, userId: ctx.user.id })
  if (lootNeed === null || lootNeed.type !== ctx.request.body.type) {
    await LootNeed.updateOne({ wid: ctx.request.body.wid, userId: ctx.user.id }, { type: ctx.request.body.type }, { upsert: true })
  } else {
    await LootNeed.deleteOne({ wid: ctx.request.body.wid, userId: ctx.user.id })
  }
  ctx.noContent()
}

async function getLootsNeeds (ctx) {
  const result = []
  const resultLootsNeeds = await LootNeed.find().populate('userId')

  for (const need of resultLootsNeeds) {
    if (need.userId && need.userId.roles && need.userId.roles.includes('member')) {
      const loot = await Loot.findOne({ wid: need.wid })
      if (loot === null) continue
      result.push({ wid: need.wid, username: need.userId.username, type: need.type, instance: loot.instance, bosses: loot.bosses })
    }
  }

  ctx.ok(result)
}

module.exports = {
  createLoot,
  updateLoot,
  getLoots,
  setLootMdC,
  setAssignText,
  deleteLoot,
  getLootLogs,
  createLootNeed,
  getLootsNeeds
}
