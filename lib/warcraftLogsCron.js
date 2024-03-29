const { Character, Item, Presence, Enchant, Buff, Attendance } = require('../models/index')
const axios = require('axios')
const moment = require('moment')
const parser = require('fast-xml-parser')

const zones = [{ id: 1000, name: 'mc', partitions: [1, 2, 3, 4, 5, 6] }, { id: 1001, name: 'onyxia', partitions: [1, 2, 3, 4, 5, 6] }, { id: 1002, name: 'bwl', partitions: [2, 3, 4, 5, 6] }, { id: 1003, name: 'zg', partitions: [2, 3, 4, 5, 6] }, { id: 1004, name: 'aq20', partitions: [3, 4, 5, 6] }, { id: 1005, name: 'aq40', partitions: [3, 4, 5, 6] }, { id: 1006, name: 'naxxramas', partitions: [5, 6] }]

const getItems = async () => {
  const characters = await Character.find().populate('userId')
  for (const character of characters) {
    if (character.userId && character.userId.roles && (character.userId.roles.includes('member') || character.userId.roles.includes('casu'))) {
      try {
        for (const zone of zones) {
          for (const partition of zone.partitions) {
            console.log(`Loading data for user ${character.name} from zone ${zone.name} and partition ${partition}`)
            const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/parses/character/${character.name}/Sulfuron/EU?zone=${zone.id}&partition=${partition}&api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

            const reports = []
            for (const encounter of result.data) {
              if (!reports.includes(encounter.reportID) && moment(encounter.startTime).isAfter(moment().subtract(9999, 'days'))) {
                reports.push(encounter.reportID)
              }
            }
            for (const report of reports) {
              const fights = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${report}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
              let friendlyId = null
              for (const friendly of fights.data.friendlies) {
                if (character.name === friendly.name) { friendlyId = friendly.id }
              }
              const startTime = fights.data.start
              const endTime = fights.data.end
              if (friendlyId === null) {
                console.log(`Something got wrong on parsing user ${character.name} ... It should be in the report ${report}`)
                continue
              }

              const events = await axios.get(`https://classic.warcraftlogs.com:443/v1/report/events/summary/${report}?end=${endTime - startTime}&sourceid=${friendlyId}&filter=type%3D%22combatantinfo%22&api_key=${encodeURI(process.env.WARCRAFTLOGS_API_KEY)}`)

              for (const event of events.data.events) {
                for (const indexGear in event.gear) {
                  const gear = event.gear[indexGear]

                  const wowheadXmlInfos = await axios.get(`https://classic.wowhead.com/item=${gear.id}&xml`)
                  const wowheadJsonInfos = parser.parse(wowheadXmlInfos.data)

                  if (wowheadJsonInfos && wowheadJsonInfos.wowhead && wowheadJsonInfos.wowhead.item && wowheadJsonInfos.wowhead.item.inventorySlot) {
                    const item = await Item.findOne({ wid: gear.id, enchantId: gear.permanentEnchant, characterId: character._id })

                    if (item === null) {
                      await new Item({
                        wid: gear.id,
                        slot: wowheadJsonInfos.wowhead.item.inventorySlot,
                        enchantId: gear.permanentEnchant,
                        characterId: character._id,
                        firstDate: startTime,
                        lastDate: startTime
                      }).save()
                    } else {
                      const date = moment(startTime)
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
      console.log(`Checking presences for report ${reportSummary.id}`)
      const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

      for (const characterWCL of result.data.friendlies) {
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
            case 1004:
              instance = 'aq20'
              break
            case 1005:
              instance = 'aq40'
              break
            case 1006:
              instance = 'naxxramas'
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

  const zones = { 1006: 'naxxramas' }

  const reports = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/reports/guild/OWLS/Sulfuron/EU?start=${moment().subtract(1000, 'days').unix() * 1000}&api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

  for (const reportSummary of reports.data) {
    if (!Object.keys(zones).includes(reportSummary.zone.toString())) continue
    console.log(`Getting data for ${zones[reportSummary.zone]} report id ${reportSummary.id}`)

    const characters = {}
    const fights = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
    for (const friendly of fights.data.friendlies) {
      const character = await Character.findOne({ name: friendly.name })
      if (character) {
        characters[friendly.id] = character._id
      }
    }
    const eventsData = await axios.get(`https://classic.warcraftlogs.com:443/v1/report/events/summary/${reportSummary.id}?end=${reportSummary.end - reportSummary.start}&filter=type%3D%22combatantinfo%22&api_key=${encodeURI(process.env.WARCRAFTLOGS_API_KEY)}`)
    for (const event of eventsData.data.events) {
      if (!characters[event.sourceID]) continue
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
            characterId: characters[event.sourceID],
            slot: wowheadJsonInfos.wowhead.item.inventorySlot
          }
          await Enchant.updateOne(enchant, enchant, { upsert: true })
        }
      }
    }

    for (const friendlyId of Object.keys(characters)) {
      const buffsData = await axios.get(`https://classic.warcraftlogs.com:443/v1/report/tables/buffs/${reportSummary.id}?end=${reportSummary.end - reportSummary.start}&by=source&sourceid=${friendlyId}&api_key=${encodeURI(process.env.WARCRAFTLOGS_API_KEY)}`)
      let found = false
      for (const buffData of buffsData.data.auras) {
        found = true
        const buff = {
          date: reportSummary.start,
          instance: zones[reportSummary.zone],
          wid: buffData.guid,
          characterId: characters[friendlyId]
        }
        await Buff.updateOne(buff, buff, { upsert: true })
      }
      if (found === false) {
        const buff = {
          date: reportSummary.start,
          instance: zones[reportSummary.zone],
          wid: 0,
          characterId: characters[friendlyId]
        }
        await Buff.updateOne(buff, buff, { upsert: true })
      }
    }
  }
  console.log('End Getting Enchants')
}

const getAttendances = async () => {
  console.log('Starting Update Attendances')
  try {
    const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/reports/guild/OWLS/Sulfuron/EU?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
    for (const reportSummary of result.data) {
      console.log(`Checking Attendance for report ${reportSummary.id}`)

      const characters = {}

      const fights = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
      for (const friendly of fights.data.friendlies) {
        characters[friendly.name] = friendly.id
      }

      const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/report/fights/${reportSummary.id}?api_key=${process.env.WARCRAFTLOGS_API_KEY}`))

      for (const characterWCL of result.data.friendlies) {
        const buffsData = await axios.get(`https://classic.warcraftlogs.com:443/v1/report/tables/buffs/${reportSummary.id}?end=${reportSummary.end - reportSummary.start}&by=source&sourceid=${characters[characterWCL.name]}&api_key=${encodeURI(process.env.WARCRAFTLOGS_API_KEY)}`)
        let buffsCount = 0
        let HTFound = false
        let DMFFound = false
        for (const buffData of buffsData.data.auras) {
          if (buffData.guid === 16609 || buffData.guid === 22888 || buffData.guid === 24425 || buffData.guid === 15366) {
            buffsCount++
          }

          if ([22820, 22818, 22817].includes(buffData.guid) && HTFound === false) {
            buffsCount++
            HTFound = true
          }
          if ([23736, 23766, 23738, 23737, 23735, 23767, 23769, 23768].includes(buffData.guid) && DMFFound === false) {
            buffsCount++
            DMFFound = true
          }
        }
        await Attendance.findOneAndUpdate({ character: characterWCL.name, reportId: reportSummary.id }, { date: moment(reportSummary.start).toISOString(), character: characterWCL.name, report: reportSummary.id, status: 'ok', buffsCount: buffsCount, zone: reportSummary.zone }, { new: true, upsert: true })
      }
      await sleep(1000)
    }
    console.log('End Update Attendances')
  } catch (e) {
    console.log(e)
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
  getEnchantsBuffs,
  getAttendances
}
