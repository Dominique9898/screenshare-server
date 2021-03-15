const express = require('express')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)

http.listen(3000, function(){
  console.log('http listening on *:3000');
});
app.use(express.static(__dirname + '/public'));

const REGIST_REMOTE_CODE = 'regist-remote-code';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const DELETE_REMOTE_CODE = 'delete-remote-code';

const rooms = {}

io.on('connection', (socket) => {
  console.log('connection')
  socket.on(REGIST_REMOTE_CODE, (remoteCode) => {
    rooms[remoteCode] = {}
    rooms[remoteCode].number = 1
    console.log('创建房间号', remoteCode, 'rooms:', rooms)
  })

  socket.on(DELETE_REMOTE_CODE, (remoteCode) => {
    delete(rooms[remoteCode])
    console.log('删除房间号', remoteCode, 'rooms:', rooms)
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
