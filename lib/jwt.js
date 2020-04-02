const { JWT, JWK } = require('jose')

const generateJWT = (data) => {
  const key = JWK.asKey(process.env.JWT_SECRET)
  const token = JWT.sign(data, key, {
    expiresIn: '24 hours',
    header: {
      typ: 'JWT'
    }
  })
  return token
}

const validateJWT = (token) => {
  const key = JWK.asKey(process.env.JWT_SECRET)

  const data = JWT.verify(
    token,
    key,
    { clockTolerance: '1 min' }
  )
  return data
}

module.exports = {
  generateJWT,
  validateJWT
}
