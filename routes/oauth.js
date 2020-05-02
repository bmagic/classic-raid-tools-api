const Router = require('koa-router')
const router = new Router()
const DiscordCtrl = require('../controllers/discord')

router.get('/discord', DiscordCtrl.auth)

module.exports = router.routes()
