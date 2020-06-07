const Router = require('koa-router')
const router = new Router()
const Bank = require('../controllers/bank')
const Auth = require('../controllers/auth')

router.post('/import', (ctx, next) => Auth.authenticate(ctx, next, ['banker']), Bank.importData)
router.put('/item/free/:id', (ctx, next) => Auth.authenticate(ctx, next, ['banker']), Bank.setFree)
router.get('/logs', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Bank.getLogs)
router.get('/', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Bank.getItems)
router.get('/requests', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Bank.getItemsRequest)

router.post('/request', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu']), Bank.createItemsRequest)
router.put('/request/status/:id', (ctx, next) => Auth.authenticate(ctx, next, ['banker']), Bank.updateItemsRequestStatus)

module.exports = router.routes()
