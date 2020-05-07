const CronJob = require('cron').CronJob
const { Raid, User, Registration, BankItem } = require('./models/index')
const fetch = require('node-fetch')
const moment = require('moment')
const Nexus = require('nexushub-client')
const nexus = new Nexus({
  user_key: process.env.NEXUS_KEY,
  user_secret: process.env.NEXUS_SECRET
})
module.exports = {

  runCron: () => {
    new CronJob('0 0 20 * * *', async () => {
      await checkRaids()
    }, null, true, 'Europe/Paris')
    new CronJob('0 0 5 * * *', async () => {
      await getBankItemsPrices()
    }, null, true, 'Europe/Paris')
  }
}

const checkRaids = async () => {
  try {
    const raids = await Raid.find({ date: { $gt: moment(), $lte: moment().add(3, 'days') } }).sort('date')

    const users = await User.find({ roles: 'member' })

    for (const raid of raids) {
      const registrations = await Registration.find({ raidId: raid._id })
      const missingUsers = []
      for (const user of users) {
        let isRegistered = false
        for (const registration of registrations) {
          if (registration.userId.toString() === user._id.toString()) { isRegistered = true }
        }
        if (!isRegistered) missingUsers.push(user.discordId)
      }

      if (missingUsers.length > 0) {
        let content = ''
        for (const discordId of missingUsers) {
          content += `<@${discordId}> `
        }
        if (missingUsers.length > 1) {
          content += `vous n'avez pas renseigné vos dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} https://classicrt.bmagic.fr/raid/${raid._id}`
        } else {
          content += `tu n'as pas renseigné tes dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} https://classicrt.bmagic.fr/raid/${raid._id}`
        }
        console.log(`Send discord hook for raid ${raid._id}`)
        try {
          await fetch(process.env.DISCORD_WEBHOOK_RAID, {
            method: 'POST',
            body: JSON.stringify({ content: content }),
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const getBankItemsPrices = async () => {
  try {
    console.log('Start Update bank prices')

    const bankItems = await BankItem.find()
    for (const bankItem of bankItems) {
      if (bankItem.wid === 0) continue
      const res = await nexus.get(`/wow-classic/v1/items/sulfuron-horde/${bankItem.wid}`)
      if (res && res.stats && res.stats.current && res.stats.current.marketValue) {
        bankItem.marketValue = res.stats.current.marketValue
        bankItem.save()
      }
    }
    console.log('End Update bank prices')
  } catch (e) {
    console.log(e)
  }
}
