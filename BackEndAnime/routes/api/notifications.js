const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../../models/User');

const Notification = require('../../models/Notification');

const promiseForeach = require('promise-foreach');
const userRoles = require('../../config/roles');

const nodemailer = require('nodemailer');

const passport = require('passport');
const allowOnly = require('../middleware/roleChecker').allowOnly;
const roles = require('../../config/roles');

var request = require('request');

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

//-----------------------

router.get('/test', (req, res) => {
  return res.status(200).json('aa');
});

// ako je shedulde lista ---> imaces usera kojem treba da dodas u listu
// ako je like, comment ---> opet ces imati kojem useru da dodas u listu
router.post(
  '/addNotificationSingleUser',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let notification = new Notification({
      seen: req.body.notification.seen,
      title: req.body.notification.title,
      type: req.body.notification.type,
      content: req.body.notification.content,
      message: '',
      scheduldeDate: req.body.notification.scheduldeDate
    });

    const userID = req.body.user;

    console.log();

    User.findOne({ _id: ObjectId(userID) }, 'id email role', function(
      err,
      user
    ) {
      if (err) {
        return res.status(400).json(err);
      }
      if (user) {
        notification.user = user._id;
        notification.userRole = user.role;

        // da podesi vreme kod message tipa notifikacija
        if (notification.type == 'message') {
          notification.scheduldeDate = new Date();
        }
        if (notification.type == 'schedule') {
          notification.scheduldeDate = new Date(notification.scheduldeDate);
        }

        // podesi poruku notifikacije ---> da li mora da prima neki callback ili tako nesto, zbog async???

        new Promise(function(resolve, reject) {
          generateNotificationMessage(resolve, reject, notification);
        }).then(rez => {
          if (rez) {
            notification.save().then(rezultat => {
              if (rezultat.type != 'schedule' && rezultat.type != 'message') {
                return sendNotificationMail(
                  user.email,
                  rezultat,
                  null,
                  null,
                  res
                );
              } else {
                return res.status(200).json(rezultat);
              }
            });
          }
        });
      }
    });
  })
);

// ---> DA proverim da li radi kako treba

// kako ce da radi promis unutar promisa?????/

router.post(
  '/addNotificationToAdmins',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.find({ role: userRoles.admin }, 'email id role', function(
      err,
      admins
    ) {
      if (err) {
        return res.status(400).json(err);
      } else if (admins) {
        promiseForeach.each(
          admins,
          admin => {
            return admin.email;
          },
          (retArray, admin) => {
            return new Promise(function(resolve, reject) {
              let adminNotif = new Notification({
                seen: req.body.notification.seen,
                title: req.body.notification.title,
                type: req.body.notification.type,
                content: req.body.notification.content
              });

              adminNotif.user = admin._id;
              adminNotif.userRole = admin.role;

              // da li moze promise u promisu???/
              new Promise(function(resolve1, reject1) {
                generateNotificationMessage(resolve1, reject1, adminNotif);
              }).then(rez => {
                adminNotif.save().then(rezultat => {
                  if (rezultat) {
                    return sendNotificationMail(
                      admin.email,
                      rezultat,
                      resolve,
                      reject,
                      null
                    );
                  }
                });
              });
            });
          },
          (err, newArray) => {
            if (err) {
              return;
            }

            return res
              .status(200)
              .json('notification successfully sent to admins');
          }
        );
      } else {
        return res.status(200).json('no admins');
      }
    });
  })
);

let generateNotificationMessage = (resolve, reject, notif) => {
  if (notif.type === 'vote' || notif.type === 'comment') {
    User.findOne({ _id: ObjectId(notif.content.creator) }, 'email name').then(
      user => {
        if (notif.type === 'vote') {
          notif.message =
            user.email +
            ' ' +
            (notif.content.content ? 'likes' : 'dislikes') +
            ' anime: ' +
            notif.content.animeTitle +
            ' in list: ' +
            notif.content.playlist;

          resolve(notif);
        } else if (notif.type === 'comment') {
          notif.message = 'New comment from ' + user.email;
          resolve(notif);
        }
      }
    );
  } else if (notif.type === 'schedule') {
    notif.message = 'Reminder: ' + notif.title;
    resolve(notif);
  } else if (notif.type === 'message') {
    notif.message = notif.content.from + ' sends ' + notif.content.message;
    resolve(notif);
    // ovo jos treba da se vidi sta ce biti.....
  } else if (notif.type === 'commentReport') {
    notif.message = 'Comment report by ' + notif.content.reporterName;
    resolve(notif);
  } else {
    reject('unknown type of notification');
  }
};

let sendNotificationMail = (userEmail, notification, resolve, reject, res) => {
  request(
    'https://anime-email-server.herokuapp.com/sendEmail/' +
      userEmail +
      '/' +
      notification._id,
    function(error, response, body) {
      if (error) {
        if (reject) {
          reject(error);
        } else {
          return res.status(400).json(notification);
        }
      } else {
        if (resolve) {
          resolve('mejl poslat');
        }
        if (res) {
          return res.status(200).json(notification);
        }
      }
    }
  );
};

// samo kad trazi usera da dobavi notifikacionu listu---> manje podataka da razmenjuju

router.get(
  '/userNotifications/:user_id',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const id = req.params.user_id;

    let unseenNotifications = [];

    Notification.find({ user: ObjectId(id) })
      .then(notificationList => {
        promiseForeach.each(
          notificationList,
          unseenNotification => {
            if (!unseenNotification.seen) {
              return unseenNotification;
            } else {
              return null;
            }
          },
          (arrayEleme, unseenNotification) => {
            if (arrayEleme[0]) {
              unseenNotifications.push(arrayEleme[0]);
            }
          },
          (err, newArray) => {
            if (err) {
              return res.status(400).json(err);
            }

            return res.status(200).json(unseenNotifications);
          }
        );
      })
      .catch(err => {
        return res.status(400).json('error while retriving notification llist');
      });
  })
);

// po cemu mozes da razlikujes sve notifikacije

// po tipu   --> problem ako su 2 schedulde ---> bice onda po id od contenta, ako su 2 like onda
// po id od content-a  ---> kod

// DA SE IZMENI.....

router.post(
  '/notificationSeen',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const notification = req.body.notif;

    Notification.findOneAndUpdate(
      {
        _id: ObjectId(notification._id)
      },
      { $set: { seen: true } },
      { fields: { title: 1 }, new: true }
    )
      .then(notif => {
        return res.status(200).json('notification marked as seen');
      })
      .catch(err => res.status(400).json('error while adding notification'));
  })
);

// prepravicu sa agregate ----> mada moze i ovako da ostane....

router.get(
  '/userNotificationsSchedule/:user_id',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const id = req.params.user_id;

    let unseenNotifications = [];

    Notification.find({ user: ObjectId(id) })
      .then(notificationList => {
        promiseForeach.each(
          notificationList,
          unseenNotification => {
            if (
              !unseenNotification.seen &&
              unseenNotification.type == 'schedule'
            ) {
              return unseenNotification;
            } else {
              return null;
            }
          },
          (arrayEleme, unseenNotification) => {
            if (arrayEleme[0]) {
              let a = new Date(arrayEleme[0].scheduldeDate);

              // nekad je invalidan datum?????/
              if (a <= new Date()) {
                unseenNotifications.push(arrayEleme[0]);
              }
            }
          },
          (err, newArray) => {
            if (err) {
              return res.status(400).json(err);
            }
            return res.status(200).json(unseenNotifications);
          }
        );
      })
      .catch(err => {
        return res.status(400).json('error while retriving notification llist');
      });
  })
);

router.get(
  '/conversation/:myID/:userMail',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const myId = req.params.myID;
    const userMail = req.params.userMail;

    let retVal = [];

    User.findOne({ email: userMail }, 'name', function(err, user) {
      if (user) {
        // pronadji sve notifikacije tipa message od tog usera
        Notification.aggregate([
          {
            $match: {
              type: 'message',
              user: ObjectId(myId),
              'content.from': userMail
            }
          },
          {
            $project: {
              message: '$content.message',
              from: userMail,
              to: null,
              date: '$scheduldeDate'
            }
          }
        ]).exec((err, messages) => {
          // sve poruke sto je on meni poslao je u messages

          // sad nadji sve poruke sto si ti njemu poslao.....
          User.findById(myId, 'email', function(err, me) {
            Notification.aggregate([
              {
                $match: {
                  type: 'message',
                  user: user._id,
                  'content.from': me.email
                }
              },
              {
                $project: {
                  message: '$content.message',
                  from: me.email,
                  to: userMail,
                  date: '$scheduldeDate'
                }
              }
            ]).exec((err, messagesFromMe) => {
              retVal = messages.concat(messagesFromMe);

              retVal.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
              });

              return res.status(200).json(retVal);
            });
          });
        });
      }
    });
  })
);

router.post(
  '/markMessageAsSeen',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    Notification.updateMany(
      {
        type: 'message',
        user: ObjectId(req.body.myId),
        'content.from': req.body.hisMail,
        seen: false
      },
      {
        $set: { seen: true }
      },
      {
        fields: 'seen',
        new: true
      }
    )
      .then(updated => {
        return res.status(200).json('all marked as read');
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  })
);

module.exports = router;
