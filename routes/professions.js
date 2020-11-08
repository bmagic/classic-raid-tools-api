const Router = require('koa-router')
const router = new Router()
const Professions = require('../controllers/professions')
const Auth = require('../controllers/auth')

router.post('/import', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu', 'apply']), Professions.importData)
router.get('/:profession', (ctx, next) => Auth.authenticate(ctx, next, ['member', 'casu', 'apply']), Professions.getProfession)

module.exports = router.routes()
