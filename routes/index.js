module.exports = (router) => {
  router.prefix('/v1')
  router.use('/oauth', require('./oauth'))
  router.use('/user', require('./user'))
  router.use('/users', require('./users'))
  router.use('/raids', require('./raids'))
  router.use('/roster', require('./roster'))
  router.use('/bank', require('./bank'))
}
