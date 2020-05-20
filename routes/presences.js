const Router = require('koa-router')
const router = new Router()
const Presences = require('../controllers/presences')
const Auth = require('../controllers/auth')

router.get('/', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Presences.getPresences)

module.exports = router.routes()
