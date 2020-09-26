const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const Comments = require('../../models/Comments');
const User = require('../../models/User');

const validateCommentInput = require('../../validation/comment');

const passport = require('passport');
const allowOnly = require('../middleware/roleChecker').allowOnly;
const roles = require('../../config/roles');

router.post(
  '/addComment',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let commentFields = {};
    commentFields.content = req.body.content;
    commentFields.creator = ObjectId(req.body.creator);
    commentFields.anime = req.body.animeTitle;
    commentFields.playList = req.body.playlist;
    commentFields.playListOwner = req.body.playListOwner;

    User.findOne({ email: commentFields.playListOwner }, '_id').then(user => {
      if (user) {
        commentFields.playListOwner = user._id;
        new Comments(commentFields)
          .save()
          .then(comment => {
            return res.status(200).json(comment);
          })
          .catch(err => {
            return res.status(404).json({
              msg: 'There was an error saving new Comment',
              err: err
            });
          });
      }
    });
  })
);

router.get(
  '/animaComments/:userEmail/:playListName/:animeTitle',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const ownerEmail = req.params.userEmail;
    const playListName = req.params.playListName;
    const animeTitle = req.params.animeTitle;

    User.findOne({ email: ownerEmail }, '_id')
      .then(user => {
        if (user) {
          Comments.find({
            playListOwner: user._id,
            playList: playListName,
            anime: animeTitle
          })
            .populate('creator', 'name email')
            .then(comments => {
              return res.status(200).json(comments);
            })
            .catch(err => {
              return res.status(400).json(err);
            });
        } else {
          return res
            .status(404)
            .json('not found user and his playlist and other stuff');
        }
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  })
);

// treba da se doda auth da moze samo admin da koristi ovu opciju
router.delete(
  '/:commentId',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    const commentId = req.params.commentId;

    Comments.deleteOne({ _id: ObjectId(commentId) })
      .then(removed => {
        return res.status(200).json('comment successfully removed');
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  })
);

module.exports = router;
