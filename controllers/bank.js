const { BankItem, BankItemLog } = require('../models')
const { base64decode } = require('nodejs-base64')

async function importData (ctx) {
  const base64 = ctx.request.body.data
  // base64 = 'W1Ryb2xsaW5lLDgwNzAsZW5VU107Wy0xLCwwLEJhY2twYWNrLDEsU21hbGwgQmx1ZSBQb3VjaCwyLFNtYWxsIEdyZWVuIFBvdWNoLDMsTGluZW4gQmFnLDQsTGluZW4gQmFnLDUsLDYsLDcsLDgsLDksLDEwLCwxMSwsMTIsXTtbLTEsMSwyNDU2LDNdO1stMSwyLDE3MDU2LDJdO1swLDEsNjk0OCwxXTtbMCwyLDQ4OTMsNV07WzAsMywxNDU0NCwxXTtbMCw0LDQ4OTQsNV07WzAsNSw1MDY4LDFdO1swLDYsNTA2MiwxMl07WzAsNyw1MDg4LDFdO1swLDgsNTA3NywxXTtbMCw5LDg1OCwxXTtbMCwxMCw1MDMwLDEyXTtbMCwxMSw1MDc2LDFdO1swLDEyLDQ4OTUsMV07WzAsMTQsNTQ2OSwxXTs='
  const data = base64decode(base64)

  if (data.indexOf('[') !== 0) {
    ctx.throw(400)
  }

  const dataArray = data.split(';')

  let character = null
  const importItemsObject = {}
  for (const index in dataArray) {
    const itemArray = dataArray[index].substring(1, dataArray[index].length - 1).split(',')

    if (parseInt(index) === 0) {
      character = itemArray[0]
      importItemsObject[0] = parseInt(itemArray[1])
    } else if (parseInt(index) >= 2) {
      if (itemArray.length === 4) {
        if (importItemsObject[parseInt(itemArray[2])] !== undefined) {
          importItemsObject[parseInt(itemArray[2])] = importItemsObject[parseInt(itemArray[2])] + parseInt(itemArray[3])
        } else {
          importItemsObject[parseInt(itemArray[2])] = parseInt(itemArray[3])
        }
      }
    }
  }

  const importItems = []
  for (const key of Object.keys(importItemsObject)) {
    importItems.push({ wid: parseInt(key), quantity: importItemsObject[key] })
  }

  const bankItems = await BankItem.find({ character: character })

  const importLogs = []
  // Check diff with bank
  for (const importItem of importItems) {
    let inBank = false
    for (const bankItem of bankItems) {
      if (importItem.wid === bankItem.wid) {
        inBank = true

        if (importItem.quantity !== bankItem.quantity) {
          importLogs.push({ wid: importItem.wid, prevQuantity: bankItem.quantity, quantity: importItem.quantity })
        }
      }
    }
    if (!inBank) {
      importLogs.push({ wid: importItem.wid, prevQuantity: 0, quantity: importItem.quantity })
    }
  }

  for (const bankItem of bankItems) {
    let found = false
    for (const importLog of importLogs) {
      if (bankItem.wid === importLog.wid) {
        found = true
      }
    }
    for (const importItem of importItems) {
      if (bankItem.wid === importItem.wid) {
        found = true
      }
    }
    if (!found) {
      importLogs.push({ wid: bankItem.wid, prevQuantity: bankItem.quantity, quantity: 0 })
    }
  }

  const currentDate = new Date()
  for (const importLog of importLogs) {
    await new BankItemLog({ date: currentDate, wid: importLog.wid, character: character, prevQuantity: importLog.prevQuantity, quantity: importLog.quantity }).save()
  }

  await BankItem.deleteMany({ character: character })
  for (const importItem of importItems) {
    // Fetch category from Wowhead
    await new BankItem({ wid: importItem.wid, character: character, quantity: importItem.quantity }).save()
  }

  ctx.noContent()
}

async function getItems (ctx) {
  const result = await BankItem.aggregate([
    {
      $group: { _id: '$wid', quantity: { $sum: '$quantity' }, characters: { $push: '$character' }, marketValue: { $first: '$marketValue' }, freeForMembers: { $first: '$freeForMembers' } }
    },
    { $sort: { _id: 1 } }
  ])
  ctx.ok(result)
}

async function setFree (ctx) {
  if (ctx.request.body && ctx.request.body.free !== undefined) {
    await BankItem.updateMany({ wid: ctx.params.id }, { freeForMembers: ctx.request.body.free })
    ctx.noContent()
  } else {
    ctx.throw(400)
  }
}

async function getLogs (ctx) {
  const result = await BankItemLog.find().sort({ _id: -1 }).limit(500)
  ctx.ok(result)
}

module.exports = {
  importData,
  getLogs,
  getItems,
  setFree
}
