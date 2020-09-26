const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const VoteSchema = new Schema({
  content: {
    type: Boolean,
    required: true,
    allowNull: false
  },
  date: {
    type: Date,
    default: () => {
      return new Date();
    }
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    allowNull: false,
    ref: 'user'
  },

  // 3 parametra po kojima ce da ga jedinstveno pronadjes
  anime: {
    type: String,
    required: true,
    allowNull: false
  },
  playList: {
    type: String,
    required: true,
    allowNull: false
  },
  playListOwner: {
    type: Schema.Types.ObjectId,
    required: true,
    allowNull: false,
    ref: 'user'
  }
});

module.exports = Vote = mongoose.model('vote', VoteSchema);
