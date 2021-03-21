const Router = require('koa-router')
const router = new Router()
const Attendances = require('../controllers/attendances')

router.get('/', Attendances.getAttendances)


module.exports = router.routes()
