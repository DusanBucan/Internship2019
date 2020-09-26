const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const Votes = require('../../models/Vote');
const User = require('../../models/User');

const passport = require('passport');
const allowOnly = require('../middleware/roleChecker').allowOnly;
const roles = require('../../config/roles');

const validateCommentInput = require('../../validation/comment');

router.post(
  '/addVote',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    //const { errors, isValid } = validateCommentInput(req.body);   ====> treba da bude validacija za Vote da li je sve ispravno.....

    isValid = true;

    if (!isValid) {
      //ako nije validno 400
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
        //pogledaj da li je vec glasao.....
        Votes.findOne(
          {
            creator: commentFields.creator,
            playList: req.body.playlist,
            anime: req.body.animeTitle,
            playListOwner: user._id
          },
          'content'
        )
          .then(vote => {
            if (vote) {
              Votes.findOneAndUpdate(
                {
                  creator: commentFields.creator,
                  playList: req.body.playlist,
                  anime: req.body.animeTitle,
                  playListOwner: user._id
                },
                {
                  $set: { content: commentFields.content }
                },
                { new: true }
              )
                .then(updateVote => {
                  return res.status(200).json(updateVote);
                })
                .catch(err => {
                  return res.status(404).json({
                    msg: 'There was an error updating new vote',
                    err: err
                  });
                });
            }
            // nije glasao dodajes novu ocenu,,,
            else {
              commentFields.playListOwner = user._id;
              new Votes(commentFields)
                .save()
                .then(vote => {
                  return res.status(200).json(vote);
                })
                .catch(err => {
                  return res.status(404).json({
                    msg: 'There was an error saving new vote',
                    err: err
                  });
                });
            }
          })
          .catch(err => {
            return res.status(400).json('vote not found');
          });
      }
    });
  })
);

router.post(
  '/howIRated',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOne({ email: req.body.playListOwner }, '_id')
      .then(user => {
        Votes.findOne(
          {
            creator: ObjectId(req.body.user),
            playList: req.body.playlist,
            anime: req.body.animeTitle,
            playListOwner: user._id
          },
          'content'
        )
          .then(vote => {
            return res.status(200).json(vote);
          })
          .catch(err => {
            return res.status(400).json('vote not found');
          });
      })
      .catch(err => {
        return res.status(400).json('vote not found');
      });
  })
);

router.get(
  '/animaVotes/:userEmail/:playListName/:animeTitle',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const ownerEmail = req.params.userEmail;
    const playListName = req.params.playListName;
    const animeTitle = req.params.animeTitle;

    User.findOne({ email: ownerEmail }, '_id')
      .then(user => {
        if (user) {
          Votes.find({
            playListOwner: user._id,
            playList: playListName,
            anime: animeTitle
          })
            .populate('creator', 'name email')
            .then(votes => {
              return res.status(200).json(votes); /// da li treba sve ili samo da li je true ili false........
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

module.exports = router;
