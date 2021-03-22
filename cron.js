const CronJob = require('cron').CronJob
const { Raid, User, Registration, LootNeed, Item } = require('./models/index')
const { sendMessage } = require('./lib/discordWebhook')
const moment = require('moment')
const axios = require('axios')
const parser = require('fast-xml-parser')

const { getItems, getPresences, getEnchantsBuffs, getAttendances } = require('./lib/warcraftLogsCron')
const { getBankItemsPrices } = require('./lib/nexusHubCron')

module.exports = {

  runCron: async () => {
    await getBankItemsPrices()
    new CronJob('0 0 5 * * *', async () => {
      await getBankItemsPrices()
    }, null, true, 'Europe/Paris')
    await getPresences()
    new CronJob('0 0 6 * * *', async () => {
      await getPresences()
    }, null, true, 'Europe/Paris')
    await getItems()
    new CronJob('0 0 7 * * *', async () => {
      await getItems()
    }, null, true, 'Europe/Paris')
    await getEnchantsBuffs()
    new CronJob('0 30 7 * * *', async () => {
      await getEnchantsBuffs()
    }, null, true, 'Europe/Paris')
    await getAttendances()
    new CronJob('0 0 2  * * *', async () => {
      await getAttendances()
    }, null, true, 'Europe/Paris')
  }
}
