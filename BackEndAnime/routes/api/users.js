const express = require('express');
const cryptoRandomString = require('crypto-random-string');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); //  da kreiras token
const keys = require('../../config/keys');
const passport = require('passport');
//const allowOnly = require('./middleware/roleChecker').allowOnly;
const roles = require('../../config/roles');
const ObjectId = require('mongoose').Types.ObjectId;

const promiseForeach = require('promise-foreach');

const nodemailer = require('nodemailer');

const allowOnly = require('../middleware/roleChecker').allowOnly;

var request = require('request');
var Notification = require('../../models/Notification');

//---------------------------
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

// Load User model
const User = require('../../models/User');
const Comments = require('../../models/Comments');
const Votes = require('../../models/Vote');
const Token = require('../../models/VerificationToken');

// Load Input validation
const validateRegisterInput = require('../../validation/register');
const validatePasswordInput = require('../../validation/password');
const validateLoginInput = require('../../validation/login');
const validateListInput = require('../../validation/createList');
const validateUpdateInput = require('../../validation/update');

// @route   GET api/users/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Users works' });
});

// @route   POST api/users/register
// @desc    Register an User
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  } else {
    User.findOne({ email: req.body.email }, 'email', function(err, user) {
      if (err) {
        return res.status(400).json(err);
      }

      console.log(user);

      if (user) {
        errors.email = 'Email already exists';
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          notificationList: [],
          // inicialno ima 2 prazne liste
          myAnimeLists: [
            { name: 'schedule', animes: [], accessibility: 'false' },
            { name: 'watched', animes: [], accessibility: 'true' }
          ]
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                var token = new Token({
                  _userEmail: user.email,
                  token: cryptoRandomString({ length: 30, type: 'url-safe' })
                });
                token
                  .save()
                  .then(token => {
                    let mailOptions = {
                      from: '"Tim3 Levi9" <tim3jds@gmail.com>',
                      to: token._userEmail,
                      subject: 'Anime Verification mail',
                      html:
                        '<html><head><body><p>' +
                        '<h3>Welcome ' +
                        user.name +
                        ',</h3>' +
                        'You are just one step away from activating your account, click on the link and start enjoying:' +
                        ' <a href="http://' +
                        req.headers.host +
                        '/api/user/confirmation/' +
                        token.token +
                        '">verification</a></p></body></html>'
                    };
                    // slanje mejla
                    transporter.sendMail(mailOptions, (err, info) => {
                      if (err) {
                        return res.status(400).json(err);
                      }
                      return res.status(200).json(user);
                    });
                  })
                  .catch(err =>
                    res
                      .status(500)
                      .json('error while saving new validation token')
                  );
              })
              .catch(err =>
                res.status(500).json('error while saving new user')
              );
          });
        });
      }
    }).catch(err => {
      res.status(500).json('error while searching for user in DB');
    });
  }
});

// @route   POST api/users/login
// @access  Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find an user by email
  User.findOne(
    { email: email },
    'isVerified password name id blockedDueDate',
    function(err, user) {
      if (err) {
        errors.msg = err;
        return res.status(400).json(errors);
      }

      if (!user) {
        errors.msg = 'User not found';

        return res.status(404).json(errors);
      }
      if (!user.isVerified) {
        errors.msg = 'User not verified';
        return res.status(404).json(errors);
      }

      if (new Date(user.blockedDueDate) >= new Date()) {
        errors.msg = 'User is blocked due' + user.blockedDueDate;
        return res.status(404).json(errors);
      }
      // Check Password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User Matched and create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 86400 },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            }
          );
        } else {
          errors.msg = 'Password incorrect';
          return res.status(400).json(errors);
        }
      });
    }
  );
});

// @route   POST api/users/confirmation/:token
// @desc    Verify an User
// @access  Public
router.get('/confirmation/:token', (req, res) => {
  Token.findOne({ token: req.params.token })
    .then(token => {
      let userEmail = token._userEmail;
      User.findOne({ email: userEmail }, 'isVerified', function(err, user) {
        if (err) {
          return res.status(400).json(err);
        }
        if (user) {
          if (!user.isVerified) {
            user.isVerified = true;
            user.save().then(() => {
              res.redirect('https://anime-frontend.herokuapp.com/login');
            });
          } else {
            verificationFaildFunction(req, res, 'Account already verified');
          }
        } else {
          verificationFaildFunction(req, res, 'Account not exists');
        }
      });
    })
    .catch(err => {
      verificationFaildFunction(req, res, 'Verification token expires');
    });
});

let verificationFaildFunction = function(req, res, err) {
  res.status(200).render('failedAccountVerifcation', {
    ErrorMessage: err ? err : 'unknown error'
  });
};

//@route POST api/user/changepassword
//@desc Change user password
router.post(
  '/changepassword',

  (req, res) => {
    const { errors, isValid } = validatePasswordInput(req.body);

    if (!isValid) {
      return res.status(400).json({ msg: errors.password });
    }

    let userFields = {};
    userFields.oldPasswprd = req.body.password; /// hvatas stari
    userFields.newPassword = req.body.password2;
    userFields.newPassword2 = req.body.password3;

    User.findOne({ email: req.body.email }, 'password', function(err, user) {
      if (err) {
        return res.status(400).json(err);
      } else {
        if (user) {
          bcrypt.compare(userFields.oldPasswprd, user.password).then(equal => {
            if (equal) {
              user.password = userFields.newPassword;
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                  if (err) {
                    throw err;
                  }
                  user.password = hash;

                  // posto je ogroman objekat user --> update ce da vrati sam neka polja nazad back--> pa back na front
                  User.findOneAndUpdate(
                    { email: req.body.email },
                    { $set: { password: user.password } },
                    {
                      fields: { name: 1, password: 1, email: 1 },
                      new: true
                    }
                  )
                    .then(user => {
                      return res.status(200).json(user);
                    })
                    .catch(err => {
                      return res.status(404).json({
                        msg: 'There was an error updating user',
                        err: err
                      });
                    });
                });
              });
            } else {
              return res.status(400).json({
                msg: 'Wrong old password'
              });
            }
          });
        } else {
          return res.status(400).jsonO({
            msg: 'Doesnt exists'
          });
        }
      }
    });
  }
);

// @route   DELETE api/user/:user_id
// @desc    Delete User By Id
// @access  Private (Admin)
router.delete(
  //dodaj da ne moze sebe da obrise
  '/:user_id',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    const user = req.user;

    User.deleteOne({ _id: ObjectId(req.params.user_id) })
      .then(result => {
        if (result) {
          Comments.deleteMany({ creator: ObjectId(req.params.user_id) })
            .then(result => {
              Votes.deleteMany({ creator: ObjectId(req.params.user_id) })
                .then(result => {
                  return res.status(200).json({
                    msg: 'User removed and all his comments, votes'
                  });
                })
                .catch(err => {
                  return res.status(400).json({
                    msg: 'User removed error while deleteing his votes'
                  });
                });
            })
            .catch(err => {
              return res.status(400).json({
                msg: 'User removed error while deleteing his comments'
              });
            });
        } else {
          return res.status(400).json({ msg: 'User does not exists' });
        }
      })
      .catch(err => {
        return res.status(404).json({
          msg: 'There was an error removing user',
          err: err
        });
      });
  })
);

//Update user or create -- endpoint, add privace only admin
//@route POST api/user/
router.post('/', (req, res) => {
  const { errors, isValid } = validateUpdateInput(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  let userFields = {};

  userFields.name = req.body.name;
  userFields.email = req.body.email;
  //userFields.password = req.body.password; // sta da radim kad vec stigne sahesovano....
  userFields.role = req.body.role;
  userFields.bio = req.body.bio;
  userFields.address = req.body.address;

  User.findOne({ _id: ObjectId(req.body.id) }, '', function(err, user) {
    if (err) {
      return res.status(400).json(err);
    } else {
      if (user) {
        User.findOneAndUpdate(
          { _id: ObjectId(req.body.id) },
          {
            // treba da se doda za bio i address
            $set: {
              name: userFields.name,
              email: userFields.email,
              role: userFields.role,
              address: userFields.address,
              bio: userFields.bio
            }
          },
          {
            fields: { role: 1, name: 1, email: 1, id: 1, bio: 1, address: 1 },
            new: true
          }
        )
          .then(UpdatedUser => {
            return res.status(200).json(UpdatedUser);
          })
          .catch(err => {
            return res.status(404).json({
              err: err,
              msg: 'There was an error updating user'
            });
          });
      }
      // dodaje admin novog
      else {
        userFields.password = 'newuser'; // citsto onako
        const newUser = User(userFields);

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json(err);
            }
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                var token = new Token({
                  _userEmail: user.email,
                  token: cryptoRandomString({ length: 30, type: 'url-safe' })
                });
                token
                  .save()
                  .then(token => {
                    let mailOptions = {
                      from: '"Tim3 Levi9" <tim3jds@gmail.com>',
                      to: token._userEmail,
                      subject: 'Anime Verification mail',
                      html:
                        '<html><head><body><p>' +
                        '<h3>Hello</h3>' +
                        'Please verify your account by clicking the link and entering new password:' +
                        ' <a href="http://' +
                        req.headers.host +
                        '/api/user/newUserAddedByADmin/' +
                        token.token +
                        '">verification</a></p></body></html>'
                    };
                    // slanje mejla
                    transporter.sendMail(mailOptions, (err, info) => {
                      if (err) {
                        return res.status(400).json(err);
                      }
                      return res.status(200).json(user);
                    });
                  })
                  .catch(err =>
                    res
                      .status(500)
                      .json('error while saving new validation token')
                  );
              })
              .catch(err =>
                res.status(500).json('error while saving new user')
              );
          });
        });
      }
    }
  });
});

//see all users - private(admin)--add that
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    let errors = {};
    User.find()
      .then(users => {
        if (users.length === 0) {
          errors.no_users = 'There are no users';
          return res.status(400).json(errors);
        }

        return res.status(200).json(users);
      })
      .catch(err => {
        return res.status(404).json({
          msg: 'There was an error fetching users from database',
          err: err
        });
      });
  })
);

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let payload = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      bio: req.user.bio,
      address: req.user.address
    };
    res.json(payload);
  })
);

router.get(
  '/getAll',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const searchParam = req.query.searchParam;

    const pageIndex = +req.query.pageIndex;
    const pageSize = +req.query.pageSize;

    let leng = 0;

    storieByUser = [];

    User.find(
      {
        $and: [
          { _id: { $ne: ObjectId(req.user._id) } },
          {
            $or: [
              { name: { $regex: '.*' + searchParam + '.*', $options: '-i' } },
              { email: { $regex: '.*' + searchParam + '.*', $options: '-i' } }
            ]
          }
        ]
      },
      'id name email role password blockedDueDate',
      function(err, users) {
        if (err) {
          return res.status(400).json(err);
        } else if (users) {
          leng = users.length;
          users = users.slice(pageIndex * pageSize, pageSize * (1 + pageIndex));
          return res.status(200).json({ users: users, length: leng });
        } else {
          return res.status(404).json('users not found');
        }
      }
    );
  })
);

// @route POST api/users/login
// public access

// @route api/user/logout
router.get(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return console.log(err);
      }
      res.redirect('/');
    });
  })
);

// nzm da li postoji user u bazi ali ja lepo pogodim ovu metodu....
router.get(
  '/findByID/:_userID',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOne({ _id: ObjectId(req.params._userID) })
      .then(user => {
        res.status(200).json(user);
      })
      .catch(err => {
        res.status(400).json(err);
      });
  })
);

// captcha
router.post('/captcha', function(req, res) {
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.

  if (!req.body.captcha) {
    return res.json({ responseCode: 1, responseDesc: 'Please select captcha' });
  }
  // Put your secret key here.
  var secretKey = '6Ld_UrMUAAAAAI58T-M5OqdDXS3tNzEuiRUeiB59';
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    req.body.captcha +
    '&remoteip=' +
    req.connection.remoteAddress;

  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl, function(error, response, body) {
    body = JSON.parse(body);

    // Success will be true or false depending upon captcha validation.
    if (body.success !== undefined && !body.success) {
      return res.json({
        responseCode: 1,
        responseDesc: 'Failed captcha verification'
      });
    }
    res.json({ responseCode: 0, responseDesc: 'Sucess' });
  });
});

// dobavi imena mojih playlista

router.get(
  '/myAnimePlaylists/:user_id',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOne(
      { _id: ObjectId(req.params.user_id) },
      'id myAnimeLists.name',
      function(err, listNames) {
        // sad kad imas imena lista dobavi sliku iz prve anime iz te liste

        console.log(listNames);

        promiseForeach.each(
          listNames.myAnimeLists,
          listName => {
            return listName.name;
          },
          (retArray, listName) => {
            console.log(listName);

            return new Promise(function(resolve, reject) {
              User.aggregate([
                {
                  // da pronadje usera po id i po nazivu playliste
                  $match: {
                    _id: ObjectId(req.params.user_id)
                  }
                },
                { $unwind: '$myAnimeLists' },
                {
                  $match: { 'myAnimeLists.name': listName.name }
                },
                {
                  $project: {
                    name: '$myAnimeLists.name',
                    coverImages: '$myAnimeLists.animes.coverImages',
                    privacy: '$myAnimeLists.accessibility'
                  }
                }
              ]).exec(function(err, anime) {
                if (err) {
                  reject(err);
                } else {
                  images = anime[0];
                  const indx = listNames.myAnimeLists.findIndex(
                    x => x.name == images.name
                  );

                  listNames.myAnimeLists[indx].coverImages = images.coverImages;
                  listNames.myAnimeLists[indx].privacy = images.privacy;
                  resolve(anime);
                }
              });
            });
          },
          (err, newArray) => {
            if (err) {
              return res.status(400).json('error while retriving list details');
            } else {
              console.log(listNames);
              return res.status(200).json(listNames);
            }
          }
        );
      }
    );
  })
);

// back i baza razmenjuju samo detalje za tu listu ---> bilo bi lepo kad bih mogao da iskljucim polja iz svake anime koja mi ne trebaju ovde.....

//nadji sve anime iz te liste
router.get(
  '/myPlaylistDetails/:user_id/:listName',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.aggregate([
      {
        // da pronadje usera po id i po nazivu playliste
        $match: {
          _id: ObjectId(req.params.user_id)
        }
      },
      {
        $project: { myAnimeLists: '$myAnimeLists', _id: 0 }
      },
      { $unwind: '$myAnimeLists' },
      {
        $match: {
          'myAnimeLists.name': req.params.listName
        }
      },
      { $unwind: '$myAnimeLists.animes' },
      {
        $project: {
          //listName: '$myAnimeLists.name', ==> koristilo se sa group
          title: '$myAnimeLists.animes.title',
          synopsis: '$myAnimeLists.animes.synopsis',
          coverImages: '$myAnimeLists.animes.coverImages',
          malScore: '$myAnimeLists.animes.malScore',
          episodes: '$myAnimeLists.animes.episodes',
          malId: '$myAnimeLists.animes.malId'
        }
      }
      // suvisan korak... ---> cisto za vezbu
      // {
      //   $group: {
      //     _id: '$listName',
      //     animes: {
      //       $push: {
      //         title: '$title',
      //         synopsis: '$synopsis',
      //         coverImages: '$coverImages',
      //         malScore: '$malScore',
      //         episodes: '$episodes'
      //       }
      //     }
      //   }
      // }
    ]).exec(function(err, animes) {
      if (err) {
        return res.status(400).json(err);
      }
      if (animes) {
        // dobabi za svaku od anima i broje komentara koji ima.....

        promiseForeach.each(
          animes,
          anime => {
            return anime.title;
          },
          (retArray, anime) => {
            return new Promise(function(resolve, reject) {
              Comments.find(
                {
                  anime: anime.title,
                  playList: req.params.listName,
                  playListOwner: ObjectId(req.params.user_id)
                },
                '_id'
              )
                .then(comments => {
                  let indx = animes.findIndex(x => x.title == anime.title);

                  a = Object.assign({}, anime);
                  a.commentNumber = comments.length;
                  animes[indx] = a;

                  resolve(a);
                })
                .catch(err => {
                  reject(err);
                });
            });
          },
          (err, newArray) => {
            if (err) {
              return res.status(400).json('error while retriving list details');
            } else {
              console.log(animes);
              return res.status(200).json(animes);
            }
          }
        );
      }
    });
  })
);

router.post(
  '/suspendUser',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    User.findOneAndUpdate(
      { _id: ObjectId(req.body.id) },
      { $set: { blockedDueDate: req.body.date } },
      {
        fields: { name: 1, email: 1 },
        new: true
      }
    )
      .then(user => {
        return res.status(200).json('user blocked');
      })
      .catch(err => {
        return res.status(400).json('user not blocked successfully');
      });
  })
);

router.post(
  '/unblockUser',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    User.findOneAndUpdate(
      { _id: ObjectId(req.body.id) },
      { $set: { blockedDueDate: null } },
      {
        fields: { name: 1, email: 1 },
        new: true
      }
    )
      .then(user => {
        return res.status(200).json('user blocked');
      })
      .catch(err => {
        return res.status(400).json('user not blocked successfully');
      });
  })
);

//@route POST api/user/createList
//@desc CREATE OR UPDATE A LIST
router.post(
  '/createList',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const { errors, isValid } = validateListInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let listFields = {};
    listFields.name = req.body.name;
    listFields.accessibility = req.body.accessibility;

    listFields.animes = [];
    //listFields.creator = req.body.creator;

    User.findOne(
      {
        _id: ObjectId(req.body._id),
        myAnimeLists: { $elemMatch: { name: req.body.name } }
      },
      'myAnimeLists.$',
      function(err, user) {
        if (err) {
          errors.msg = err;
          return res.status(400).json(errors);
        } else {
          if (user) {
            errors.name = 'This playlist already exists';
            return res.status(400).json(errors);
          } else {
            User.findOneAndUpdate(
              { _id: ObjectId(req.body._id) },
              { $push: { myAnimeLists: listFields } },
              { fields: { 'myAnimeLists.name': 1 }, new: true }
            )
              .then(user => {
                if (user) {
                  return res.status(200).json(user);
                } else {
                  console.log('kao ovde');
                }
              })
              .catch(err => {
                return res.status(400).json(err);
              });
          }
        }
      }
    );
  })
);

//deleteList(userId: number, namee: string)
router.delete(
  '/deleteList/:user_id/:name',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOneAndUpdate(
      { _id: ObjectId(req.params.user_id) },
      {
        $pull: {
          myAnimeLists: { name: req.params.name }
        }
      },
      {
        fields: { 'myAnimeLists.name': 1 },
        new: true
      }
    )
      .then(user => {
        if (user) {
          // ako je scheduli lista da obrise sve schedule notifikacije za tog usera...
          Notification.deleteMany({
            type: 'schedule',
            user: user._id
          }).then(removed => {
            return res.status(200).json(user);
          });
        } else {
          console.log('kao ovde');
        }
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  })
);

router.delete(
  '/animeFromList/:user_id/:listName/:animeTitle',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const userID = req.params.user_id;
    const listName = req.params.listName;
    const animeTitle = req.params.animeTitle;

    User.findOneAndUpdate(
      {
        _id: ObjectId(userID)
      },
      {
        $pull: { 'myAnimeLists.$[element].animes': { title: animeTitle } }
      },
      {
        fields: { name: 1 },
        new: true,
        arrayFilters: [{ 'element.name': listName }]
      }
    )
      .then(user => {
        // treba da proveri da li je schedule lista ===> ako jeste da notifikaciju za tu animu obrise...
        if (user) {
          if (listName == 'schedule') {
            Notification.deleteOne({
              type: 'schedule',
              user: ObjectId(userID),
              'content.title': animeTitle
            })
              .then(notif => {
                return res.status(200).json('removed from list');
              })
              .catch(errNotif => {
                return res.status(400).json(errNotif);
              });
          } else {
            return res.status(200).json('removed from list');
          }
        }
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  })
);

router.post(
  '/getByEmail',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOne(
      { email: req.body.email },
      'email name address bio image'
    ).then(user => {
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(400).json('not found user by email');
      }
    });
  })
);

// za upload slike

const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'detyu5wgu',
  api_key: '149523534573761',
  api_secret: 'uB4AD_fJmfUmfveiALK538g615o'
});
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'demo',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 400, height: 400, crop: 'limit' }]
});
const parser = multer({ storage: storage });

router.post('/uploadImages', parser.single('image'), (req, res) => {
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;

  User.findOneAndUpdate(
    { _id: ObjectId(req.body.userID) },
    {
      $set: { image: image }
    },
    {
      new: true,
      fields: 'image id'
    }
  ).then(user => {
    return res.status(200).json(image);
  });

  // Image.create(image) // save image information in database
  //   .then(newImage => res.json(newImage))
  //   .catch(err => console.log(err));
});

router.get('/userImage/:userId', (req, res) => {
  User.findOne({ _id: ObjectId(req.params.userId) }, 'image').then(user => {
    return res.status(200).json(user);
  });
});

module.exports = router;
