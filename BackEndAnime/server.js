const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const db = require('./config/keys').mongoURI;

const users = require('./routes/api/users');
const animes = require('./routes/api/anime');
const notification = require('./routes/api/notifications');
const comments = require('./routes/api/comments');
const votes = require('./routes/api/votes');

const app = express();

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

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
// ovo znaci---> body objekat koji stigne sa fronta u ZAHTEVU
// pretvara u JSON objekat
app.use(bodyParser.json()); //for parsing application/json

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.log(err);
  });

// PASSPORT MIDDLEWARE
app.use(passport.initialize()); // onaj middleawre od gore ucitan

// Passport Config
require('./config/passport')(passport); // ovo smo fiju ucitali i sad njoj kad prosledimo middleware ona doda Strategiju u Passport middleware

// REGISTRUJTE OVDE SVE RUTE!!!!!!
app.use('/api/user', users);
app.use('/api/anime', animes);
app.use('/api/notification', notification);
app.use('/api/comments', comments);
app.use('/api/votes', votes);

app.get('/', (req, res) => res.send('caoo'));

// static file
app.set('views', './assets');
app.set('view engine', 'pug'); // za renderovanje templ

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server Server running on port ${port}`));

module.exports = app;
