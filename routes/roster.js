const Router = require('koa-router')
const router = new Router()
const Roster = require('../controllers/roster')
const Auth = require('../controllers/auth')

router.get('/', Auth.authenticate, Roster.getCharacters)
module.exports = router.routes()
