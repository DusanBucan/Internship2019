const mongoose = require('mongoose');
const userRoles = require('../config/roles.js');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    allowNull: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    allowNull: false
  },
  password: {
    type: String,
    required: true,
    allowNull: false
  },
  role: {
    type: Number,
    default: userRoles.user,
    required: true,
    allowNull: false
  },
  isVerified: { type: Boolean, default: false },

  blockedDueDate: {
    type: Date,
    default: null
  },
  // imace liste i u svakoj od lista ce imati id-ve od Anima koje su u nasoj DB sacuvani

  myAnimeLists: [{}]
});

module.exports = User = mongoose.model('user', UserSchema);
