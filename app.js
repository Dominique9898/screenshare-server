const express = require('express')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)
const randomize = require('randomatic');

http.listen(3000, function(){
  console.log('http listening on *:3000');
});
app.use(express.static(__dirname + '/public'));

const REGISTER_REMOTE_CODE = 'register-remote-code';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const DELETE_REMOTE_CODE = 'delete-remote-code';
const SEND_OFFERSDP = 'send-offersdp';

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
    socket.to(user.remoteCode).emit('USER_JOINED', user.userId)
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
