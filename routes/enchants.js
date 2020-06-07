const Router = require('koa-router')
const router = new Router()
const Enchants = require('../controllers/enchants')
const Auth = require('../controllers/auth')

router.get('/:instance/:date', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Enchants.getEnchants)
router.get('/raids', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Enchants.getEnchantsRaids)

module.exports = router.routes()
