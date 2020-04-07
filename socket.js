const IO = require('koa-socket-2')
const app = require('./server')

const io = new IO()
io.attach(app)

io.on('connection', (ctx, data) => {
  ctx.on('room', function (room) { // take room variable from client side
    ctx.join(room)
    io.to(room).emit('message', { // Emits a status message to the connect room when a socket client is connected
      type: 'status',
      text: 'connection',
      created: Date.now()
    })
    ctx.on('disconnect', function () { // Emits a status message to the connected room when a socket client is disconnected
      io.to(room).emit({
        type: 'status',
        text: 'disconnected',
        created: Date.now()
      })
    })
  })
})
