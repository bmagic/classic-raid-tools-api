const Router = require('koa-router')
const router = new Router()
const User = require('../controllers/user')
const Auth = require('../controllers/auth')

router.get('/', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), User.getUsers)
router.put('/roles/:id', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), User.setRoles)
router.put('/mdc/:id', (ctx, next) => Auth.authenticate(ctx, next, ['admin']), User.setMdC)
module.exports = router.routes()
