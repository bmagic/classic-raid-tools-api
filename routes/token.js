const Router = require('koa-router')
const router = new Router()
const Token = require('../controllers/token')

router.post('/', Token.refreshToken)

module.exports = router.routes()
