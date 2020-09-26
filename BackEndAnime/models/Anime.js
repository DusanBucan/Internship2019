const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AnimeListSchema = new Schema({
  malId: {
    // ovo je id sa  MyAnimeList
    type: Number,
    required: true,
    allowNull: false
  },
  title: {
    type: String,
    required: true,
    allowNull: false
  },
  characters: {},
  genres: [{}],

  coverImages: {
    type: String,
    required: false
  },
  aired: {},
  seasons: {
    type: Number
  },
  episodes: {
    type: Number
  },
  type: [],
  synopsis: {},

  // ovo ce da se prebaci za svaki element list
  accessibility: {
    type: Number,
    default: 1,
    allowNull: false
  },
  malScore: { type: Number, allowNull: true }
});
module.exports = AnimeList = mongoose.model('anime', AnimeListSchema);
