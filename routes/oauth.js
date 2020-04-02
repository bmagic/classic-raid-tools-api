const Router = require('koa-router')
const router = new Router()
const DiscordCtrl = require('../controllers/discord')
const GithubCtrl = require('../controllers/github')

router.get('/discord', DiscordCtrl.auth)
router.get('/github', GithubCtrl.auth)

module.exports = router.routes()
