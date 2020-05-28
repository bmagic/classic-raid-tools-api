const CronJob = require('cron').CronJob
const { Raid, User, Registration, BankItem, Presence, Character } = require('./models/index')
const { sendMessage } = require('./lib/discordWebhook')
const axios = require('axios')
const moment = require('moment')
const Nexus = require('nexushub-client')
const nexus = new Nexus({
  user_key: process.env.NEXUS_KEY,
  user_secret: process.env.NEXUS_SECRET
})
module.exports = {

  runCron: async () => {
    new CronJob('0 0 20 * * *', async () => {
      await checkRaids()
    }, null, true, 'Europe/Paris')
    await getBankItemsPrices()
    new CronJob('0 0 5 * * *', async () => {
      await getBankItemsPrices()
    }, null, true, 'Europe/Paris')
    await getPresences()
    new CronJob('0 0 6 * * *', async () => {
      await getPresences()
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

const getBankItemsPrices = async () => {
  try {
    console.log('Start Update bank prices')

    const bankItems = await BankItem.find()
    for (const bankItem of bankItems) {
      if (bankItem.wid === 0) continue
      console.log(`Updating price for wid ${bankItem.wid} `)
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

const getPresences = async () => {
  console.log('Starting Update Presences')
  try {
    const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/reports/guild/OWLS/Sulfuron/EU?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
    for (const reportSummary of result.data) {
      const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

      for (const characterWCL of result.data.exportedCharacters) {
        const character = await Character.findOne({ name: characterWCL.name }).populate('userId')
        if (character !== null && character.userId !== null) {
          let instance = null
          switch (reportSummary.zone) {
            case 1000 :
              instance = 'mc'
              break
            case 1001 :
              instance = 'onyxia'
              break
            case 1002 :
              instance = 'bwl'
              break
            case 1003:
              instance = 'zg'
              break
          }
          if (instance) {
            await Presence.findOneAndUpdate({ userId: character.userId._id, characterId: character._id, reportId: reportSummary.id, instance: instance }, { date: moment(reportSummary.start).toISOString(), userId: character.userId._id, characterId: character._id, report: reportSummary.id, instance: instance, status: 'ok' }, { new: true, upsert: true })
          } else {
            console.error(`Cannot found instance zone ${reportSummary.zone}`)
          }
        }
      }
      await sleep(1000)
    }
    console.log('End Update Presences')
  } catch (e) {
    console.log(e)
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
