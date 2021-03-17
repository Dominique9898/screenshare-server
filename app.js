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
const USER_JOINED = 'user-joined';
const EXCHANGE_CANDIDATE = 'exchange-candidate';
const SCREEN_ANSWER_TO_CLIENT = 'screen-answer-to-client';
const CLIENT_OFFER_TO_SCREEM = 'client-offer-to-screem';

app.get('/', (res, req) => {
  req.redirect('/display')
})
app.get('/display', (res, req) => {
  req.sendFile(__dirname + '/' + 'display.html')
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
    socket.to(user.remoteCode).emit(USER_JOINED, user)
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

  socket.on(SCREEN_SEND_OFFER, (offer) => {
    console.log('SCREEN_SEND_OFFER', offer)
  })
})
