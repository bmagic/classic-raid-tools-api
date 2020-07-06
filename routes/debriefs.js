const Router = require('koa-router')
const router = new Router()
const Debriefs = require('../controllers/debriefs')
const Auth = require('../controllers/auth')

router.get('/:instance/:date', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'apply', 'casu']), Debriefs.getDebrief)
router.get('/', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'apply', 'casu']), Debriefs.getRaids)

module.exports = router.routes()
