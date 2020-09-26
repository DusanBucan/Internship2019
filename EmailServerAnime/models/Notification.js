const mongoose = require('mongoose');
const userRoles = require('../config/roles.js');
const Schema = mongoose.Schema;

// Create Schema
const NotifcationSchema = new Schema({
  type: {
    type: String,
    required: true,
    allowNull: false
  },
  content: {},
  title: {
    type: String,
    required: true,
    allowNull: false
  },
  seen: { type: Boolean, default: false },
  scheduldeDate: {
    type: Date,
    default: null
  },
  // za kojeg usera
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    allowNull: false,
    ref: 'user'
  },
  userRole: {
    type: Number,
    required: true,
    allowNull: false
  }
});

module.exports = Notification = mongoose.model(
  'notification',
  NotifcationSchema
);
