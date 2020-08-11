const Router = require('koa-router')
const router = new Router()
const Availability = require('../controllers/availability')
const Auth = require('../controllers/auth')

router.get('/', Auth.authenticate, Availability.getAvailabilities)
router.get('/all', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), Availability.getAllAvailabilities)
router.put('/', Auth.authenticate, Availability.putAvailabilities)

module.exports = router.routes()
