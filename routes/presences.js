const Router = require('koa-router')
const router = new Router()
const Presences = require('../controllers/presences')
const Auth = require('../controllers/auth')

router.get('/', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Presences.getPresences)

router.del('/:id', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), Presences.deletePresence)
router.post('/', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), Presences.createPresence)

module.exports = router.routes()
