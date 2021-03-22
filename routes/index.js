module.exports = (router) => {
  router.prefix('/v1')
  router.use('/oauth', require('./oauth'))
  router.use('/user', require('./user'))
  router.use('/users', require('./users'))
  router.use('/roster', require('./roster'))
  router.use('/bank', require('./bank'))
  router.use('/presences', require('./presences'))
  router.use('/items', require('./items'))
  router.use('/characters', require('./characters'))
  router.use('/debriefs', require('./debriefs'))
  router.use('/professions', require('./professions'))
  router.use('/attendances', require('./attendances'))
}
