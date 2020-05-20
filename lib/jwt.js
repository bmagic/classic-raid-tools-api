const { JWT, JWK } = require('jose')

const generateJWT = (data) => {
  const key = JWK.asKey(process.env.JWT_SECRET)
  const token = JWT.sign(data, key, {
    expiresIn: '30d',
    header: {
      typ: 'JWT'
    }
  })
  return token
}

const validateJWT = (token, clockTolerance) => {
  const key = JWK.asKey(process.env.JWT_SECRET)

  const data = JWT.verify(
    token,
    key,
    { clockTolerance: clockTolerance }
  )
  return data
}

module.exports = {
  generateJWT,
  validateJWT

}
