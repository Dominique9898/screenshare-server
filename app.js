const express = require('express')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)
const randomize = require('randomatic');

http.listen(3000, function(){
  console.log('http listening on *:3000');
});
app.use(express.static(__dirname + '/public'));

const CREATE_REMOTE_CODE = 'create-remote-code';
const CREATE_REMOTE_CODE_TEST = 'create-remote-code-test';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const DELETE_REMOTE_CODE = 'delete-remote-code';
const SEND_OFFER = 'send-offer';

const rooms = {}

io.on('connection', (socket) => {
  console.log('connection')
  // 测试用
  // socket.on(CREATE_REMOTE_CODE_TEST, () => {
  //   const remoteCode = 'ABCDEFG'
  //   const userId = 'dominik'
  //   socket.join(remoteCode);
  //   socket.broadcast.to(remoteCode).emit('new-user-connect', userId);
  //   socket.on('disconnect', () => {
  //     socket.broadcast.to(remoteCode).emit('user-disconnected', userId);
  //   });
  // })

  socket.on(CREATE_REMOTE_CODE, (userId, callback) => {
    const remoteCode = randomize('A0', 6)
    rooms[remoteCode] = {}
    rooms[remoteCode].number = 1
    callback(remoteCode)
    socket.join(remoteCode);
    console.log(userId,'创建房间号', remoteCode, 'rooms:', rooms)
  })

  socket.on(DELETE_REMOTE_CODE, (remoteCode, userId) => {
    // 用户断开连接
    delete(rooms[remoteCode])
    socket.emit(DELETE_REMOTE_CODE, userId)
    console.log(userId, '取消投屏房间号', remoteCode, 'rooms:', rooms)
  })

  socket.on(ENTER_REMOTE_ROOM, (remoteCode,  userId) => {
    socket.join(remoteCode)
    if(rooms.hasOwnProperty(remoteCode)) {
      rooms[remoteCode].number++
      console.log(userId + ' 加入Roon:' + remoteCode, '总人数', rooms[remoteCode].number)
    } else {
      console.log('房间不存在', rooms)
    }
  })

  socket.on(SEND_OFFER, (offer) => {
    console.log(offer)
  })
})
