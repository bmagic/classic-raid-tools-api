const Router = require('koa-router')
const router = new Router()
const Raids = require('../controllers/raids')
const Auth = require('../controllers/auth')

router.get('/next', Raids.getNextRaids)
router.get('/:id', (ctx, next) => Auth.authenticate(ctx, next, 'member'), Raids.getRaid)
router.post('/', (ctx, next) => Auth.authenticate(ctx, next, 'modify_raid'), Raids.createRaid)

module.exports = router.routes()
