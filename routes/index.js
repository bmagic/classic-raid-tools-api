module.exports = (router) => {
  router.prefix('/v1')
  router.use('/oauth', require('./oauth'))
  router.use('/user', require('./user'))
}
