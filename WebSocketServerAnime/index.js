var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// CORS filter
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// konekcija na bazu
// const mongoose = require('mongoose');
// const db = require('./config/keys').mongoURI;
// mongoose
//   .connect(db, {
//     useNewUrlParser: true,
//     useCreateIndex: true
//   })
//   .then(() => {
//     console.log('MongoDB Connected');
//   })
//   .catch(err => {
//     console.log(err);
//   });

onlineUsers = [];

app.get('/users', function(req, res) {
  res.status(200).json(onlineUsers);
});

io.on('connection', function(socket) {
  socket.on('login', function(user) {
    socket.join(user.email); // dodam taj socket u room

    let socketId = this.id;

    let indx = onlineUsers.findIndex(x => x.email == user.email);
    if (indx == -1) {
      onlineUsers.push({ email: user.email, socketID: socketId });
    } else {
      onlineUsers[indx].socketID = socketId;
    }

    // ako je admin dodas ga u room i za admine ---> zato sto ces tu da saljes report za komentare
    if (user.role == 4) {
      socket.join('admin');
    }

    io.emit('neWuser', user.email);
  });

  // kad neko prijavi komentar adminu --> da mu stigne notifikacija ---> mejl mu salje backEnd
  socket.on('reportedComment', function(comment) {
    io.to('admin').emit('ReviewRepotedComment', comment);
  });

  // ako je uradio log-out ---> trebalo bi biti vezano na jedan isti event....
  socket.on('disconect', function(email) {
    let indx = onlineUsers.findIndex(x => x.email == email);
    if (indx != -1) {
      onlineUsers.splice(indx, 1);
    }
    io.emit('userLogOut', email);
  });

  socket.on('disconnect', function() {
    let disc = this.id;
    let indx = onlineUsers.findIndex(x => x.socketID == disc);
    if (indx != -1) {
      let email = onlineUsers[indx].email;
      io.emit('userLogOut', email);
      onlineUsers.splice(indx, 1);
    }
  });

  socket.on('sendMessage', function(params) {
    io.to(params.email).emit('OnNewMessage', {
      message: params.NewMessage,
      from: params.Sender,
      fromID: params.senderID
    });
  });

  socket.on('comment', function(notif) {
    io.to(notif.content.playListOwner).emit('animaCommented', {
      message: notif,
      from: notif.content.sender
    });

    io.emit('newComment', notif.content);
  });

  socket.on('rateAnime', function(notif) {
    io.to(notif.content.playListOwner).emit('OnMyAnimeRated', {
      message: notif,
      from: notif.content.sender
    });

    io.emit('OnAnimeRated', notif.content);
  });

  // svi koji su na stranici details za tu animu da im se obrise komentar.... ---> ako nisu na toj stranici
  // ili ako su na toj stranici ali neka druga anima da se nista ne desi....
  socket.on('commentRemove', function(commentId) {
    io.emit('animaCommentRemoved', commentId);
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});
