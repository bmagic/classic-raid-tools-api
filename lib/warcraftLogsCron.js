const { Character, Item, Presence, Enchant } = require('../models/index')
const axios = require('axios')
const moment = require('moment')
const parser = require('fast-xml-parser')

const getItems = async () => {
  const zones = [{ id: 1000, name: 'mc' }, { id: 1001, name: 'onyxia' }, { id: 1002, name: 'bwl' }, { id: 1003, name: 'zg' }]
  const partitions = [1, 2]

  const characters = await Character.find().populate('userId')
  for (const character of characters) {
    if (character.userId && character.userId.roles && character.userId.roles.includes('member')) {
      try {
        for (const zone of zones) {
          for (const partition of partitions) {
            console.log(`Loading data for user ${character.name} from zone ${zone.name} and partition ${partition}`)
            const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/parses/character/${character.name}/Sulfuron/EU?zone=${zone.id}&partition=${partition}&api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
            for (const encounter of result.data) {
              for (const indexGear in encounter.gear) {
                if (indexGear === '3') continue
                const gear = encounter.gear[indexGear]

                if (gear.id === null || gear.id === 0) continue
                const itemSlots = ['head', 'neck', 'shoulder', 'empty', 'chest', 'waist', 'legs', 'feet', 'wrist', 'hands', 'finger', 'finger', 'trinket', 'trinket', 'back', 'weapon', 'weapon', 'ranged']

                const item = await Item.findOne({ wid: gear.id, characterId: character._id })
                if (item === null) {
                  await new Item({
                    wid: gear.id,
                    slot: itemSlots[indexGear],
                    characterId: character._id,
                    firstDate: encounter.startTime,
                    lastDate: encounter.startTime
                  }).save()
                } else {
                  const date = moment(encounter.startTime)
                  if (date.isBefore(moment(item.firstDate))) {
                    item.firstDate = date
                    await item.save()
                  }
                  if (date.isAfter(moment(item.lastDate))) {
                    item.lastDate = date
                    await item.save()
                  }
                }
              }
            }
            await sleep(200)
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
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

const getEnchantsBuffs = async () => {
  console.log('Starting Getting Enchants')

  const zones = { 1002: 'bwl' }

  const reports = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/reports/guild/OWLS/Sulfuron/EU?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

  for (const reportSummary of reports.data) {
    if (!Object.keys(zones).includes(reportSummary.zone.toString())) continue
    console.log(`Getting data for ${zones[reportSummary.zone]} report id ${reportSummary.id}`)

    const characters = {}
    const fights = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
    for (const friendly of fights.data.friendlies) {
      characters[friendly.id] = friendly.name
    }
    const events = await axios.get(`https://classic.warcraftlogs.com:443/v1/report/events/summary/${reportSummary.id}?end=${reportSummary.end - reportSummary.start}&filter=type%3D%22combatantinfo%22&api_key=${encodeURI(process.env.WARCRAFTLOGS_API_KEY)}`)
    for (const event of events.data.events) {
      for (const indexGear in event.gear) {
        const gear = event.gear[indexGear]

        const wowheadXmlInfos = await axios.get(`https://classic.wowhead.com/item=${gear.id}&xml`)
        const wowheadJsonInfos = parser.parse(wowheadXmlInfos.data)

        if (wowheadJsonInfos && wowheadJsonInfos.wowhead && wowheadJsonInfos.wowhead.item && wowheadJsonInfos.wowhead.item.inventorySlot) {
          const enchant = {
            date: reportSummary.start,
            instance: zones[reportSummary.zone],
            wid: gear.id,
            enchantId: gear.permanentEnchant,
            name: characters[event.sourceID],
            slot: wowheadJsonInfos.wowhead.item.inventorySlot
          }
          await Enchant.updateOne(enchant, enchant, { upsert: true })
        }
      }
    }
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  getItems,
  getPresences,
  getEnchantsBuffs
}
