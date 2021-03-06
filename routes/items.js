const Router = require('koa-router')
const router = new Router()
const Items = require('../controllers/items')
const Auth = require('../controllers/auth')

router.get('/character/:id', Auth.authenticate, Items.getCharacterItems)
router.get('/', Auth.authenticate, Items.getItems)
router.get('/last', Items.getLastItems)
module.exports = router.routes()
