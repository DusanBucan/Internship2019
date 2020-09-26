const express = require('express');
const router = express.Router();
const passport = require('passport');
const roles = require('../../config/roles');
const allowOnly = require('../middleware/roleChecker').allowOnly;
const ObjectId = require('mongoose').Types.ObjectId;

const Anime = require('../../models/Anime');
const User = require('../../models/User');

const promiseForeach = require('promise-foreach');
var request = require('request');

const fetch = require('cross-fetch');

const API = 'https://api.jikan.moe/v3/anime';

router.get('/test', (req, res) => {
  res.json({ msg: 'Anime works' });
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const mal_id = req.body.animeToAdd.mal_id;
    const list = req.body.list;
    const userId = req.body.user_id;

    Anime.findOne({ malId: mal_id }).then(foundAnime => {
      if (!foundAnime) {
        let anime = {};
        anime.type = req.body.animeToAdd.type;
        anime.malScore = req.body.animeToAdd.score;

        // DOBAVI SVE PODATKE KOJI TI TREBAJU DA SACUVAS i sacuva animu
        loadAnimeCharactersAndActors(mal_id, anime, res, userId, list);
      } else {
        User.findOneAndUpdate(
          {
            _id: ObjectId(userId),
            myAnimeLists: { $elemMatch: { name: list } } /// dodas da u listi anima nije ona anima koju dodajes...
          },
          // da doda bas u tu listu animu.....  --> addToSet ---> lepo proveri da li ima duplikata ili nema
          {
            $addToSet: { 'myAnimeLists.$.animes': foundAnime } /// doda u listu u koju treba
          },
          { fields: { 'myAnimeLists.name': 1 }, new: true }
        )
          .then(user => {
            res.status(200).json('anime successfully added to user list');
            // da pribelezi animu ako ne postoji u nasoj bazi
          })
          .catch(err => {
            res.status(400).json(err);
          });
      }
    });
  })
);

let loadAnimeCharactersAndActors = (animeID, anime, res, userId, listName) => {
  let url_characters = API + '/' + animeID + '/characters_staff';
  let url_gernes = API + '/' + animeID + '/';

  fetch(url_characters)
    .then(result => {
      if (result.status >= 400) {
        throw new Error('Bad response from server');
      }
      return result.json();
    })
    .then(characters => {
      anime.characters = characters;

      fetch(url_gernes)
        .then(resultGenres => {
          if (resultGenres.status >= 400) {
            throw new Error('Bad response from server');
          }
          return resultGenres.json();
        })
        .then(payload => {
          anime.title = payload.title;
          anime.genres = payload.genres;
          anime.synopsis = payload.synopsis;
          anime.malId = payload.mal_id;
          anime.coverImages = payload.image_url;
          anime.episodes = payload.episodes;
          anime.aired = payload.aired;

          // sacuvavanje anime u bazu

          new Anime(anime).save().then(savedAnime => {
            // moras pronaci usera

            User.findOneAndUpdate(
              {
                _id: ObjectId(userId),
                myAnimeLists: { $elemMatch: { name: listName } } /// dodas da u listi anima nije ona anima koju dodajes...
              },
              // da doda bas u tu listu animu.....  --> addToSet ---> lepo proveri da li ima duplikata ili nema
              {
                $addToSet: { 'myAnimeLists.$.animes': savedAnime } /// doda u listu u koju treba
              },
              { fields: { 'myAnimeLists.name': 1 }, new: true }
            )
              .then(user => {
                res.status(200).json('anime successfully added to user list');
                // da pribelezi animu ako ne postoji u nasoj bazi
              })
              .catch(err => {
                res.status(400).json(err);
              });
          });
        })
        .catch(err => {
          return res.status(400).json(err);
        });
    })
    .catch(err => {
      return res.status(400).json(err);
    });
};

//

router.post(
  '/searchLocal',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let searchParam = req.body.param.searchParam;
    let page = req.body.param.page;

    const pageSize = 10; // ovoliko ce da vraca

    // pretrazim anime po parametrima
    // onda za usere pogledam da li imaju tu animu u playlistama

    Anime.aggregate([
      {
        $match: {
          title: {
            $regex: '.*' + searchParam + '.*',
            $options: '-i'
          }
        }
      },
      {
        $project: {
          title: '$title',
          synopsis: '$synopsis',
          coverImages: '$coverImages',
          malScore: '$malScore',
          episodes: '$episodes'
        }
      }
    ]).exec(function(err, animes) {
      if (err) {
        return res.status(400).json(err);
      } else {
        let animesTitles = animes.map(x => x.title);

        // za svakom usera sa map izdvojis da mu u plat

        User.aggregate([
          // izdvoje sve usere koji imaju makar jednu accessibility listu i ta lista
          // ima vise od jedne anime

          {
            $match: {
              myAnimeLists: {
                $elemMatch: {
                  accessibility: 'true'
                }
              }
            }
          },

          // sad imam za svakog usera name
          // i myAnime list je lista gde je svaki element ima
          // listu anima
          // nazivListe
          {
            $project: {
              email: 1,
              name: 1,
              _id: 0,
              myAnimeLists: {
                $setDifference: [
                  {
                    $map: {
                      input: '$myAnimeLists',
                      as: 'el',
                      in: {
                        $cond: {
                          if: { $eq: ['$$el.accessibility', 'true'] },
                          then: {
                            listName: '$$el.name',
                            animes: '$$el.animes'
                          },
                          else: { listName: 'false' }
                        }
                      }
                    }
                  },
                  [{ listName: 'false' }]
                ]
              }
            }
          },
          {
            $unwind: '$myAnimeLists'
          },

          // za svaku animu sad dodas polje result ---> koje sluzi
          // da se proveri da li naziv anime macthc-uje regex
          {
            $project: {
              email: 1,
              name: 1,
              myAnimeLists: {
                $map: {
                  input: '$myAnimeLists.animes',
                  as: 'el',
                  in: {
                    // za svaku animu u napravi

                    $cond: [
                      { $in: ['$$el.title', animesTitles] },
                      {
                        result: true,
                        listName: '$myAnimeLists.listName',
                        animeTitle: '$$el.title'
                      },
                      {
                        result: false,
                        listName: '$myAnimeLists.listName',
                        animeTitle: '$$el.title'
                      }
                    ]
                  }
                }
              }
            }
          },

          //ta play lista moze imati sammo jedna element
          {
            $project: {
              email: 1,
              name: 1,
              myAnimeLists: {
                $setDifference: [
                  {
                    $map: {
                      input: '$myAnimeLists',
                      as: 'el',
                      in: {
                        $cond: [
                          '$$el.result',
                          {
                            listName: '$$el.listName',
                            animeTitle: '$$el.animeTitle'
                          },
                          { listName: 'false' }
                        ]
                      }
                    }
                  },
                  [{ listName: 'false' }]
                ]
              }
            }
          },

          // imas sve nazive playlista tog usera koje sadrze animu
          // sa tim naslovom.....
          {
            $group: {
              _id: '$name',
              listNames: { $push: '$myAnimeLists' }, // list names ce sada imati i naziv liste i animeTitle... ---> treba
              email: { $addToSet: '$email' }
            }
          },
          // grupisi po list name ---> da animeTititles --
          {
            $project: {
              email: '$email',
              listNames: 1,
              name: '$_id',
              _id: 0,
              total: { ukupno: '' }
            }
          }
          // bez ovog nema paginacije jer nzm koliko je ostalo da li front treba da prikaze dugme da load more...
          // drugi nacin za load more je da dugme bude tu dokle kog kad se stisne na njega se ne vrati prazna lista ---> onda cu znati da nema vise...
          //  tako ne moram da se jebavam sa ovim
          // {
          //   $count: '$total.ukupno'
          // },
          // { $skip: page * pageSize },
          // { $limit: pageSize }
        ]).exec(function(err, playLists) {
          if (err) {
            return res.status(400).json(err);
          }
          retVal = {};

          retVal.animes = animes;

          retVal.users = [];

          promiseForeach.each(
            playLists,
            playlistUser => {
              return playlistUser.listNames;
            },
            (arrayParam, userList) => {
              var mergedListNames = [].concat.apply([], arrayParam[0]);

              if (mergedListNames.length > 0) {
                retVal.users.push({
                  name: userList.name,
                  email: userList.email[0],
                  pls: mergedListNames
                });
              }
            },
            (err, retVala) => {
              if (err) {
                return res.status(400).json(err);
              } else {
                return res.status(200).json(retVal);
              }
            }
          );
        });
      }
    });
  })
);

router.get(
  '/findOne/:anime_id',
  passport.authenticate('jwt', { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const animeId = req.params.anime_id;

    Anime.findOne(
      { title: animeId },
      'title synopsis coverImages malScore episodes malId'
    ).then(anime => {
      if (anime) {
        return res.status(200).json(anime);
      } else {
        return res.status(400).json('not found');
      }
    });
  })
);

module.exports = router;
