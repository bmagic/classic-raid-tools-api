const CronJob = require('cron').CronJob
const { Raid, User, Registration, LootNeed, Item } = require('./models/index')
const { sendMessage } = require('./lib/discordWebhook')
const moment = require('moment')
const axios = require('axios')
const parser = require('fast-xml-parser')

const { getItems, getPresences, getEnchantsBuffs } = require('./lib/warcraftLogsCron')
const { getBankItemsPrices } = require('./lib/nexusHubCron')

module.exports = {

  runCron: async () => {
    new CronJob('0 0 20 * * *', async () => {
      await checkRaids()
    }, null, true, 'Europe/Paris')
    // await getBankItemsPrices()
    new CronJob('0 0 5 * * *', async () => {
      await getBankItemsPrices()
    }, null, true, 'Europe/Paris')
    // await getPresences()
    new CronJob('0 0 6 * * *', async () => {
      await getPresences()
    }, null, true, 'Europe/Paris')
    // await getItems()
    new CronJob('0 0 7 * * *', async () => {
      await getItems()
    }, null, true, 'Europe/Paris')
    // await getEnchantsBuffs()
    new CronJob('0 30 7 * * *', async () => {
      await getEnchantsBuffs()
    }, null, true, 'Europe/Paris')
    // await checkLoots()
    new CronJob('0 0 8  * * *', async () => {
      await checkLoots()
    }, null, true, 'Europe/Paris')
  }
}

const checkRaids = async () => {
  try {
    const raids = await Raid.find({ main: true, date: { $gt: moment(), $lte: moment().add(6, 'days') } }).sort('date')

    const users = await User.find({ $or: [{ roles: 'member' }, { roles: 'apply' }] })

    for (const raid of raids) {
      const registrations = await Registration.find({ raidId: raid._id })
      const missingUsers = []
      for (const user of users) {
        let isRegistered = false
        for (const registration of registrations) {
          if (registration.userId.toString() === user._id.toString() && registration.status) { isRegistered = true }
        }
        if (!isRegistered) missingUsers.push(user.discordId)
      }

      if (missingUsers.length > 0) {
        let content = ''
        for (const discordId of missingUsers) {
          content += `<@${discordId}> `
        }
        if (missingUsers.length > 1) {
          content += `vous n'avez pas renseigné vos dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} ${process.env.FRONT_URL}/raid/${raid._id}`
        } else {
          content += `tu n'as pas renseigné tes dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} ${process.env.FRONT_URL}/raid/${raid._id}`
        }
        console.log(`Send discord hook for raid ${raid._id}`)
        await sendMessage('raid', content)
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const checkLoots = async () => {
  try {
    console.log('Check loots')
    const lootsNeed = await LootNeed.find()
    for (const lootNeed of lootsNeed) {
      let found = false
      const items = await Item.find({ wid: lootNeed.wid }).populate('characterId')

      for (const item of items) {
        if (!item.characterId) {
          console.log(`Item ${item._id} has not a valid character attached to him. I delete it.`)
          await Item.deleteOne({ _id: item._id })
          continue
        }
        if (lootNeed.userId.toString() === item.characterId.userId.toString() && item.characterId.main === true) {
          found = true
        }
      }
      if (found) {
        const user = await User.findOne({ _id: lootNeed.userId })
        const wowheadXmlInfos = await axios.get(`https://fr.classic.wowhead.com/item=${lootNeed.wid}&xml`)
        const wowheadJsonInfos = parser.parse(wowheadXmlInfos.data)

        if (wowheadJsonInfos && wowheadJsonInfos.wowhead && wowheadJsonInfos.wowhead.item && wowheadJsonInfos.wowhead.item.name) {
          const content = `<@${user.discordId}> l'item "${wowheadJsonInfos.wowhead.item.name}" a été retiré de ta wishlist car tu l'as équipé au moins une fois.`
          await sendMessage('default', content)
        }
        lootNeed.delete()
      }
    }
  } catch (e) {
    console.log(e)
  }
}
