const { BankItem } = require('../models/index')
const Nexus = require('nexushub-client')
const nexus = new Nexus({
  user_key: process.env.NEXUS_KEY,
  user_secret: process.env.NEXUS_SECRET
})

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

module.exports = {
  getBankItemsPrices
}
