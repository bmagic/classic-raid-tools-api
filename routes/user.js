const Router = require('koa-router')
const router = new Router()
const User = require('../controllers/user')
const Auth = require('../controllers/auth')

router.get('/', Auth.authenticate, User.getUser)
router.post('/register', User.register)
router.post('/login', User.login)
module.exports = router.routes()
