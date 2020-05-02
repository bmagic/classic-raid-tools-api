const Router = require('koa-router')
const router = new Router()
const Raids = require('../controllers/raids')
const Auth = require('../controllers/auth')

router.get('/next', Auth.authenticate, Raids.getNextRaids)
router.get('/:id/registrations', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Raids.getRegistrations)
router.get('/:id/registration-logs', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Raids.getRegistrationLogs)
router.get('/:id', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Raids.getRaid)
router.put('/:id', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Raids.updateRaid)

router.post('/', (ctx, next) => Auth.authenticate(ctx, next, ['modify_raid']), Raids.createRaid)
router.post('/registration', (ctx, next) => Auth.authenticate(ctx, next, ['member']), Raids.createRegistration)
module.exports = router.routes()
