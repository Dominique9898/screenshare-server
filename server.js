const express = require('express')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)

http.listen(3000, function(){
  console.log('http listening on *:3000');
});
const randomize = require('randomatic');
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const SEND_OFFERSDP = 'send-offersdp';

app.get('/', (req, res) => {
  res.send('Hello World')
})

// const rooms = {}
const rooms = ['123456']

io.on('connection', (socket) => {
  console.log('connection')


  socket.on(ENTER_REMOTE_ROOM, (user, cb) => {
    if (user.userId === '') {
      user.userId = randomize('Aa0', 6)
      user.created = Date.now();
    }
    user.status = 'connected';
    socket.join(user.remoteCode);
    socket.to(user.remoteCode).emit('USER_JOINED', user)
    console.log(`server: ${user.userId} enter room:${user.remoteCode}`);
    if (cb) {
      cb(user)
    }
  })

  socket.on(LEAVE_REMOTE_ROOM, (user, cb) => {
    // 退出投屏房间
    socket.leave(user.remoteCode)
    user.status = 'disconnected';
    console.log(`server: ${user.userId} leave room:${user.remoteCode}`);
    user.remoteCode = '';
    if (cb) {
      cb(user)
    }
  })

  socket.on(SEND_OFFERSDP, (remoteCode, desc) => {
    console.log(remoteCode, desc)
  })
})
