const fetch = require('node-fetch')

const sendMessage = async (chan, content) => {
  let webhookUrl
  switch (chan) {
    case 'bank':
      webhookUrl = process.env.DISCORD_WEBHOOK_BANK
      break
    default:
      webhookUrl = process.env.DISCORD_WEBHOOK_ADMIN
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
