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
const SCREEN_SEND_SCREEN_OFFER = 'screen-send-screen-offer';
const SCREEN_SEND_VIDEO_OFFER = 'screen-send-video-offer';
const CLIENT_SCREEN_ANSWER_TO_SCREEN = 'client-screen-answer-to-screen';
const CLIENT_VIDEO_ANSWER_TO_SCREEN = 'client-video-answer-to-screen';
const GET_SCREEN_ANSWER = 'get-screen-answer';
const GET_VIDEO_ANSWER = 'get-video-answer';
const GET_SCREEN_OFFER = 'get-screen-offer';
const GET_VIDEO_OFFER = 'get-video-offer';

const SCREEN_TO_CLIENT_SCREEN_CANDIDATE = 'screen-to-client-screen-candidate';
const SCREEN_TO_CLIENT_VIDEO_CANDIDATE = 'screen-to-client-video-candidate';

const CLIENT_TO_SCREEN_SCREEN_CANDIDATE = 'client-to-screen-screen-candidate';
const CLIENT_TO_SCREEN_VIDEO_CANDIDATE = 'client-to-screen-video-candidate';app.get('/', (res, req) => {
  req.redirect('/display')
})
app.get('/display', (res, req) => {
  req.sendFile(__dirname + '/' + 'display.html')
})
app.all("*",function(req,res,next){
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers","content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
});

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

  socket.on(SCREEN_SEND_SCREEN_OFFER, (remoteCode, offer) => {
    console.log('Server: get offer')
    socket.broadcast.to(remoteCode).emit(GET_SCREEN_OFFER, remoteCode, offer)
  })
  socket.on(SCREEN_SEND_VIDEO_OFFER, (remoteCode, offer) => {
    console.log('Server: get offer')
    socket.broadcast.to(remoteCode).emit(GET_VIDEO_OFFER, remoteCode, offer)
  })
  socket.on(CLIENT_SCREEN_ANSWER_TO_SCREEN, (remoteCode, answer) => {
    console.log('Server: get screen answer', remoteCode)
    socket.broadcast.to(remoteCode).emit(GET_SCREEN_ANSWER, remoteCode, answer)
  });
  socket.on(CLIENT_VIDEO_ANSWER_TO_SCREEN, (remoteCode, answer) => {
    console.log('Server: get video answer', remoteCode)
    socket.broadcast.to(remoteCode).emit(GET_VIDEO_ANSWER, remoteCode, answer)
  });
  socket.on(SCREEN_TO_CLIENT_SCREEN_CANDIDATE, (remoteCode, candidate) => {
    console.log('Server: get screen screen ice', candidate)
    socket.broadcast.to(remoteCode).emit(SCREEN_TO_CLIENT_SCREEN_CANDIDATE, remoteCode, candidate)
  });
  socket.on(SCREEN_TO_CLIENT_VIDEO_CANDIDATE, (remoteCode, candidate) => {
    console.log('Server: get screen video ice', candidate)
    socket.broadcast.to(remoteCode).emit(SCREEN_TO_CLIENT_VIDEO_CANDIDATE, remoteCode, candidate)
  });
  socket.on(CLIENT_TO_SCREEN_SCREEN_CANDIDATE, (remoteCode, candidate) => {
    console.log('Server: get client screen ice', candidate)
    socket.broadcast.to(remoteCode).emit(CLIENT_TO_SCREEN_SCREEN_CANDIDATE, remoteCode, candidate)
  });
  socket.on(CLIENT_TO_SCREEN_VIDEO_CANDIDATE, (remoteCode, candidate) => {
    console.log('Server: get client video ice', candidate)
    socket.broadcast.to(remoteCode).emit(CLIENT_TO_SCREEN_VIDEO_CANDIDATE, remoteCode, candidate)
  });
})
