const Router = require('koa-router')
const router = new Router()
const Characters = require('../controllers/characters')
const Auth = require('../controllers/auth')

router.get('/:name', Auth.authenticate, Characters.getCharacter)

module.exports = router.routes()
