const { ProfessionRecipe } = require('../models')

async function importData (ctx) {
  const data = ctx.request.body.data.split('\n')

  const characterName = data.shift().split(':')[1].trim()
  data.shift()
  let profession = null
  const professionRaw = data.shift().split(':')[1].trim()
  const professionsList = {
    alchemy: ['alchemy', 'alchimie'],
    enchanting: ['enchanting', 'enchantement'],
    engineering: ['engineering', 'ingénierie'],
    tailoring: ['tailoring', 'couture'],
    leatherWorking: ['leatherworking', 'travail du cuir'],
    blackSmithing: ['blacksmithing', 'forge'],
    cooking: ['cooking', 'cuisine']
  }
  for (const professionKey of Object.keys(professionsList)) {
    if (professionsList[professionKey].includes(professionRaw.toLowerCase())) { profession = professionKey }
  }

  if (profession === null) {
    ctx.throw(400, `Métier : ${professionRaw} inconnu`)
  }
  data.shift()
  data.shift()

  for (const line of data) {
    const wid = line.split('=')[1].slice(0, -1)
    await ProfessionRecipe.findOneAndUpdate({ characterName: characterName, wid: wid, profession: profession }, { characterName: characterName, wid: wid, profession: profession }, { new: true, upsert: true })
  }
  ctx.ok()
}
async function getProfession (ctx) {
  const listResult = await ProfessionRecipe.aggregate([
    { $match: { profession: ctx.params.profession } },
    {
      $group: { _id: '$wid', characterNames: { $push: '$characterName' }, count: { $sum: 1 } }
    },
    { $sort: { count: 1, _id: -1 } }
  ])

  const characterNamesResult = await ProfessionRecipe.aggregate([
    { $match: { profession: ctx.params.profession } },
    {
      $group: { _id: '$characterName', count: { $sum: 1 } }
    },
    { $sort: { count: -1 } }
  ])

  ctx.ok({ list: listResult, characterNames: characterNamesResult })
}

module.exports = {
  importData,
  getProfession
}
