const express = require('express')
const path = require('path')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)

http.listen(3000, function(){
  console.log('http listening on *:3000');
});
const randomize = require('randomatic');
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SCREEN_SEND_OFFER = 'screen-send-offer';
const CLIENT_ANSWER_TO_SCREEN = 'client-answer-to-screen';
const GET_ANSWER = 'get-answer';
const GET_OFFER = 'get-offer';

app.get('/', (res, req) => {
  req.redirect('/display')
})
app.get('/display', (res, req) => {
  req.sendFile(__dirname + '/' + 'display.html')
})

const offers = {}
const candidates = {}
const rooms = {

}

io.on('connection', (socket) => {
  console.log('connection')

  socket.on(ENTER_REMOTE_ROOM, (user, cb) => {
    const room = rooms[user.remoteCode]
    const uNumbers = room ? room.number : 0;
    if (user.userId === '') {
      user.userId = randomize('Aa0', 6)
      user.created = Date.now();
    }
    if (!uNumbers) {
      user.status = 'connected';
      rooms[user.remoteCode] = {}
      rooms[user.remoteCode].number = 1
      socket.join(user.remoteCode);
      console.log(`server: ${user.userId} create room`);
    } else if (uNumbers > 2) {
      socket.emit('full', room, socket.id);
      console.log(`server: full`);
    } else {
      user.status = 'connected';
      rooms[user.remoteCode].number++
      socket.join(user.remoteCode);
      socket.broadcast.to(user.remoteCode).emit(ENTER_REMOTE_ROOM);
      console.log(`server: ${user.userId} enter room: ${user.remoteCode}`);
    }
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

  socket.on(SCREEN_SEND_OFFER, (remoteCode, offer) => {
    console.log('Server: get offer')
    socket.broadcast.to(remoteCode).emit(GET_OFFER, remoteCode, offer)
  })

  socket.on(CLIENT_ANSWER_TO_SCREEN, (remoteCode, answer) => {
    console.log('Server: get answer', remoteCode)
    socket.broadcast.to(remoteCode).emit(GET_ANSWER, answer)
  });
})
