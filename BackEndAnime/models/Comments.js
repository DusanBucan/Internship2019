const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CommentsSchema = new Schema({
  content: {
    type: String,
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

module.exports = Comment = mongoose.model('comment', CommentsSchema);
