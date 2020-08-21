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
  const tokens = {
    // Tête d'Onyxia
    18422: [18406, 18403, 18404],
    // Tête de Nefarian
    19003: [19383, 19366, 19384],
    // Etançon primordial hakkari
    19718: [19840, 19843, 19848],
    // Egide primordiale hakkari
    19724: [19834, 19841, 19831],
    // Coeur d'Hakkar
    8183: [19948, 19950, 19949],
    // Anneau de magistrat qiraji
    20884: [21393, 21396, 21399, 21408, 21414],
    // Drapé martial qiraji
    20885: [21394, 21406, 21415, 21412],
    // Manche à pointes qiraji
    20886: [21395, 21404, 21392, 21401, 21398],
    // Anneau de cérémonie qiraji
    20888: [21411, 21417, 21405, 21402],
    // Manche orné qiraji
    20890: [21410, 21416, 21407, 21413],
    // Tête d'Ossirian l'Intouché
    21220: [21504, 21507, 21505, 21506],
    // Diadème de Vek'nilash
    20926: [21329, 21348, 21337, 21347],
    // Peau intacte d'Ouro
    20927: [21352, 21332, 21346, 21362],
    // Manchettes de commandement qiraji
    20928: [21350, 21359, 21365, 21349, 21367, 21333, 21330, 21361],
    // Carapace du Dieu très ancien
    20929: [21331, 21389, 21364, 21374, 21370],
    // Diadème de Vek'lor
    20930: [21387, 21353, 21360, 21372, 21366],
    // Peau du Grand ver des sables
    20931: [21336, 21356, 21390, 21375, 21368],
    // Manchettes de domination qiraji
    20932: [21335, 21354, 21373, 21344, 21355, 21338, 21376, 21391, 21388, 21345],
    // Carcasse du Dieu très ancien
    20933: [21334, 21343, 21357, 21351],
    // Oeil de C'Thun
    21221: [21712, 21710, 21709],
    // Armes impériales qiraji
    21232: [21242, 21272, 21244, 21269],
    // Tenue de parade impériale qiraji
    21237: [21273, 21275, 21268],
    // Cuirasse désacralisée
    22349: [22416, 22476],
    // Tunique désacralisée
    22350: [22488, 22425, 22436],
    // Robe désacralisée
    22351: [22512, 22496, 22504],
    // Cuissots désacralisés
    22352: [22417, 22477],
    // Heaume désacralisé
    22353: [22418, 22478],
    // Espauliers désacralisés
    22354: [22419, 22479],
    // Brassards désacralisées
    22355: [22423, 22483],
    // Sangle désacralisée
    22356: [22482, 22422],
    // Gantelets désacralisés
    22357: [22421, 22481],
    // Solerets désacralisés
    22358: [22480, 22420],
    // Cuissards désacralisés
    22359: [22489, 22427, 22437],
    // Couvre-chef désacralisé
    22360: [22490, 22428, 22438],
    // Spallières désacralisées
    22361: [22467, 22491, 22429, 22439],
    // Protège-poignets désacralisés
    22362: [22495, 22424, 22443],
    // Ceinturon désacralisé
    22363: [22494, 22431, 22442],
    // Garde-mains désacralisés
    22364: [22493, 22426, 22441],
    // Bottes désacralisées
    22365: [22492, 22430, 22440],
    // Jambières désacralisées
    22366: [22513, 22497, 22505],
    // Diadème désacralisé
    22367: [22514, 22498, 22506],
    // Protège-épaules désacralisés
    22368: [22515, 22499, 22507],
    // Manchettes désacralisées
    22369: [22519, 22503, 22511],
    // Ceinture désacralisée
    22370: [22518, 22502, 22510],
    // Gants désacralisés
    22371: [22517, 22501, 22509],
    // Sandales désacralisées
    22372: [22516, 22500, 22508],
    // Le phylactère of Kel'Thuzad
    22520: [23206, 23207]
  }

  try {
    console.log('Check loots')
    const lootsNeed = await LootNeed.find()
    for (const lootNeed of lootsNeed) {
      let found = false

      const lootNeedsTokensIds = tokens[lootNeed.wid] || [lootNeed.wid]
      for (const lootNeedTokensId of lootNeedsTokensIds) {
        const items = await Item.find({ wid: lootNeedTokensId }).populate('characterId')

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
