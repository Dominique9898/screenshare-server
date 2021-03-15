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
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const DELETE_REMOTE_CODE = 'delete-remote-code';

const rooms = {}

io.on('connection', (socket) => {
  console.log('connection')
  socket.on(CREATE_REMOTE_CODE, (callback) => {
    const remoteCode = randomize('A0', 6)
    rooms[remoteCode] = {}
    rooms[remoteCode].number = 1
    callback(remoteCode)
    console.log('创建房间号', remoteCode, 'rooms:', rooms)
  })

  socket.on(DELETE_REMOTE_CODE, (remoteCode) => {
    delete(rooms[remoteCode])
    console.log('取消投屏房间号', remoteCode, 'rooms:', rooms)
  })

  socket.on(ENTER_REMOTE_ROOM, (remoteCode) => {
    if(rooms.hasOwnProperty(remoteCode)) {
      rooms[remoteCode].number++
      console.log('房间已存在,有人加入房间', rooms)
    } else {
      console.log('房间不存在', rooms)
    }
  })

})
