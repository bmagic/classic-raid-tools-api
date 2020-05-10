const fetch = require('node-fetch')

const sendMessage = async (chan, content) => {
  let webhookUrl
  switch (chan) {
    case 'raid':
      webhookUrl = process.env.DISCORD_WEBHOOK_RAID
      break
    case 'bank':
      webhookUrl = process.env.DISCORD_WEBHOOK_BANK
      break
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ content: content }),
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  sendMessage
}
