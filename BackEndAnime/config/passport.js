const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
//const User = mongoose.model('user');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

// middlewaru koji je prosldjen doda stategiju sa use() imas i druge strategije
// nalepi usera kojeg pronadje po id na request

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(
        jwt_payload.id,
        'role email name id blockedDueDate image bio address',
        function(err, user) {
          if (err) {
            return done(null, false);
          }
          if (user) {
            if (new Date(user.blockedDueDate) >= new Date()) {
              return done(null, false);
            }

            return done(null, user);
          }
          return done(null, false);
        }
      );
    })
  );
};
