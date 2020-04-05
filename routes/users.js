const Router = require('koa-router')
const router = new Router()
const User = require('../controllers/user')
const Auth = require('../controllers/auth')
const Character = require('../controllers/character')

router.get('/', (ctx, next) => Auth.authenticate(ctx, next, 'admin'), User.getUsers)
router.post('/roles', (ctx, next) => Auth.authenticate(ctx, next, 'admin'), User.setRoles)

module.exports = router.routes()
