const mongoose = require('mongoose')
const moment = require('moment')
moment.locale('fr')

const server = require('./server')
mongoose.connect(process.env.MONGO_URL || 'mongodb://root:root@localhost/classic-raid-tools-api?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

require('./socket')
require('./cron').runCron().catch((e) => console.log(e))
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`API server started on ${port}`))
