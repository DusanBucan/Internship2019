var app = require('express')();
var http = require('http').Server(app);
var port = process.env.PORT || 5001;

const ObjectId = require('mongoose').Types.ObjectId;

var CronJob = require('cron').CronJob;

const Notification = require('./models/Notification');
const User = require('./models/User');

const promiseForeach = require('promise-foreach');

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

//konekcija na bazu
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('MongoDB Connected');
    sendSchuleEmails();
  })
  .catch(err => {
    console.log(err);
  });

const nodemailer = require('nodemailer');
//Start Here
// const transporter = nodemailer.createTransport({
//   host: 'smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: '6966b1dc3fde6c',
//     pass: 'd194d1841942a9'
//   }
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tim3jds@gmail.com',
    pass: 'sarakraljica'
  }
});

// fija koja na svakih sat vremena povuce sve notifikacije iz baze koje su tipa schedule i nisu seen i posalje mejl
// userima za njih......
let sendSchuleEmails = () => {
  new CronJob(
    '*/50 * * * * *',
    function() {
      console.log('You will see this message every second');
      Notification.find(
        { type: 'schedule', seen: false },
        'user content.title content.synopsis scheduldeDate'
      )
        .populate('user', 'email')
        .then(notifs => {
          // za svaku notif prodjes sa promise-for
          promiseForeach.each(
            notifs,
            notication => {
              console.log(new Date(notication.scheduldeDate) < new Date());

              if (new Date(notication.scheduldeDate) < new Date()) {
                let retVal = {
                  from: '"Test Server" <test@example.com>',
                  to: notication.user.email,
                  subject: 'Anime schedule mail',
                  html:
                    '<html><head><body><p>' +
                    '<h3>You have new schedule notification</h3>' +
                    '<h5>' +
                    notication.content.title +
                    '</h5>' +
                    '<p>' +
                    notication.content.synopsis +
                    '</p>' +
                    '<a href="https://anime-email-server.herokuapp.com/markAsSeeNotification/' +
                    notication._id +
                    '"> see anime</a></body></html>'
                };
                return retVal;
              }
              return null;
            },
            (arrayElem, notification) => {
              const mailOptions = arrayElem[0];
              if (mailOptions != null) {
                transporter.sendMail(mailOptions, (err, info) => {
                  // if (err) {
                  //   return res.status(400).json(err);
                  // }
                  // return res.status(200).json(user);
                });
              }
            },
            (err, newArray) => {
              if (err) {
                console.log(err);
              } else {
                console.log('schedule mejl svima poslat');
              }
            }
          );
        });
    },
    // ovo je on complite....
    null,
    true
  );
};

// ovo radi kad klikne na mail schedule notifikaciju see anime...

app.get('/markAsSeeNotification/:notificationId', (req, res) => {
  let notifId = req.params.notificationId;
  Notification.findOneAndUpdate(
    { _id: ObjectId(notifId) },
    { $set: { seen: true } },
    { new: true }
  )
    .populate('user', 'email')
    .then(notification => {
      console.log(notification);

      if (notification.type === 'schedule') {
        return res.redirect(
          'https://anime-frontend.herokuapp.com/animeDetails/' +
            notification.user.email +
            '/schedule/' +
            notification.content.title
        );
      } else if (notification.type === 'comment') {
        return res.redirect(
          'https://anime-frontend.herokuapp.com/animeDetails/' +
            notification.user.email +
            '/' +
            notification.content.playlist +
            '/' +
            notification.content.animeTitle
        );
      } else {
        console.log(notification.content.playListName);

        return res.redirect(
          'https://anime-frontend.herokuapp.com/animeDetails/' +
            notification.user.email +
            '/' +
            notification.content.playListName +
            '/' +
            notification.content.animeTitle
        );
      }
    })
    .catch(err => {
      return res
        .status(400)
        .json('error while processing schedule notification');
    });
});

// ovu metodu pogadja backEnd posalje id notifikacije za koju treba da se posalje mejl.. --> treba da je pogodi backEnd...
app.get('/sendEmail/:userEmail/:notifId', (req, res) => {
  console.log('saljem mejlll');

  userEmail = req.params.userEmail;
  notifId = req.params.notifId;

  Notification.findOne({ _id: ObjectId(notifId) }).then(notification => {
    // bice ovde da salje mejl nece koristit onaj EmailServer nmg sad to da cackam...

    new Promise(function(resolve, reject) {
      generateNotificationMessage(notification, resolve, reject);
    }).then(poruka => {
      const notificationMailContent = '<p>' + poruka + '</p>';

      let mailOptions = {
        from: '"Tim3 Levi9" <tim3jds@gmail.com>',
        to: userEmail,
        subject: 'Notification mail',
        html:
          '<html><head><body><p>' +
          '<h3>You have new notification</h3>' +
          notificationMailContent +
          '<a href="https://anime-email-server.herokuapp.com/markAsSeeNotification/' +
          notification._id +
          '"> see notification</a></body></html>'
      };
      // slanje mejla
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(400).json(notification);
        } else {
          return res.status(200).json(notification);
        }
      });
    });
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});

// nzm zasto nece da ucita gotovu poruku vec pa je pravim ponovo.....
let generateNotificationMessage = (notif, resolve, reject) => {
  console.log('generisanje poruke');

  let poruka = '';

  if (notif.type === 'vote' || notif.type === 'comment') {
    User.findOne({ _id: ObjectId(notif.content.creator) }, 'email name').then(
      user => {
        if (notif.type === 'vote') {
          poruka =
            user.email +
            ' ' +
            (notif.content.content ? 'likes' : 'dislikes') +
            ' anime: ' +
            notif.content.animeTitle +
            ' in list: ' +
            notif.content.playlist;

          resolve(poruka);
        } else if (notif.type === 'comment') {
          poruka = 'New comment from ' + user.email;
          resolve(poruka);
        }
      }
    );
  } else if (notif.type === 'schedule') {
    poruka = 'Reminder: ' + notif.title;
    resolve(poruka);
  } else if (notif.type === 'message') {
    poruka = notif.content.from + ' sends ' + notif.content.message;
    resolve(poruka);
    // ovo jos treba da se vidi sta ce biti.....
  } else if (notif.type === 'commentReport') {
    poruka = 'Comment report by ' + notif.content.reporterName;
    resolve(poruka);
  } else {
    reject('unknown type');
  }
};
