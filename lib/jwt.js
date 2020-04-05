const { JWT, JWK } = require('jose')
const { RefreshToken } = require('../models')

const generateJWT = (data) => {
  const key = JWK.asKey(process.env.JWT_SECRET)
  const token = JWT.sign(data, key, {
    expiresIn: '10 min',
    header: {
      typ: 'JWT'
    }
  })
  return token
}

async function generateRefreshToken (userId) {
  const key = JWK.asKey(process.env.JWT_SECRET)
  const token = JWT.sign({}, key, {
    expiresIn: '24h',
    header: {
      typ: 'JWT'
    }
  })
  await new RefreshToken({ value: token, userId: userId, date: new Date() }).save()
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
  validateJWT,
  generateRefreshToken
}
