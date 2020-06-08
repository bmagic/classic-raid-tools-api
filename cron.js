const CronJob = require('cron').CronJob
const { Raid, User, Registration } = require('./models/index')
const { sendMessage } = require('./lib/discordWebhook')
const moment = require('moment')

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
    // new CronJob('0 30 7 * * *', async () => {
    //   await getEnchantsBuffs()
    // }, null, true, 'Europe/Paris')
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
          content += `vous n'avez pas renseigné vos dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} https://classicrt.bmagic.fr/raid/${raid._id}`
        } else {
          content += `tu n'as pas renseigné tes dispos pour le raid ${raid.instance} du ${moment(raid.date).format('dddd DD MMMM HH:mm')} https://classicrt.bmagic.fr/raid/${raid._id}`
        }
        console.log(`Send discord hook for raid ${raid._id}`)
        await sendMessage('raid', content)
      }
    }
  } catch (e) {
    console.log(e)
  }
}
