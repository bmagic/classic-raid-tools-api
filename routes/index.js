module.exports = (router) => {
  router.prefix('/v1')
  router.use('/oauth', require('./oauth'))
  router.use('/user', require('./user'))
  router.use('/users', require('./users'))
  router.use('/token', require('./token'))
  router.use('/raids', require('./raids'))
}
