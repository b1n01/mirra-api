/**
 * MainController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');

module.exports = {
  /**
   * Get share key if user is public
   *
   * @param {*} req
   * @param {*} res
   */
  userKey: function(req, res) {
    return res.send({key: req.user.key, isPublic: req.user.public});
  },

  /**
   * Start sharing your account
   *
   * @param {*} req
   * @param {*} res
   */
  share: function(req, res) {
    User.updateOne({id: req.user.id})
      .set({public: true})
      .then(user => {
        return res.send({key: user.key});
      });
  },

  /**
   * Make account private
   *
   * @param {*} req
   * @param {*} res
   */
  unshare: function(req, res) {
    User.updateOne({id: req.user.id})
      .set({public: false})
      .then(() => {
        return res.send({message: 'ok'});
      });
  },

  /**
   * Play a the user 'user_key' is playing on the 'device_id' of the logged user
   *
   * @param {*} req
   * @param {*} res
   */
  play: function(req, res) {
    let userKey = req.param('user_key', null);
    let deviceId = req.param('device_id', null);

    if(!userKey || !deviceId) {
      return res.status(400).send({message: 'Wrong parameters'});
    }

    // Find user by key
    User.findOne({key: userKey})
      .then(async targetUser =>  {
        if(!targetUser) {
          return res.status(404).json({message: 'User not found'});
        }

        if(!targetUser.public) {
          return res.status(412).send({
            type: 'USER_IS_PRIVATE',
          });
        }

        // Ensure fresh token
        targetUser = await sails.helpers.getValidToken.with({user: targetUser});
        loggedUser = await sails.helpers.getValidToken.with({user: req.user});

        let getCurrentlyPlayingUrl = 'https://api.spotify.com/v1/me/player/currently-playing';
        let options = {headers: {
          Authorization: 'Bearer ' + targetUser.accessToken,
        }};

        // Get what the target user is listening
        axios.get(getCurrentlyPlayingUrl, options)
          .then(response => {
            if(!response.data) {
              return res.status(412).send({type: 'USER_NOT_ONLINE'});
            }

            let getUserProfileUrl = 'https://api.spotify.com/v1/me';
            let options = {headers: {
              Authorization: 'Bearer ' + targetUser.accessToken,
            }};

            // Get target user profile
            axios.get(getUserProfileUrl, options)
              .then((userProfile) => {
                let songUri = response.data.item.uri;
                let playUri = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
                let config = JSON.stringify({uris: [songUri]});
                let options = { headers: {
                  Authorization: 'Bearer ' + req.user.accessToken,
                }};

                // Play song for logged user on given device id
                axios.put(playUri, config, options)
                  .then(() => {
                    let profilePicUrl = userProfile.data.images.length ? userProfile.data.images.slice(-1).pop().url : null;
                    let isYou = targetUser.id === req.user.id;
                    return res.json({
                      user: {
                        name: userProfile.data.display_name,
                        profilePic: profilePicUrl,
                        isYou: isYou,
                      },
                      track: {
                        name: response.data.item.name,
                        album: response.data.item.album.name,
                        artists: response.data.item.artists.map(artist => artist.name).join(', '),
                        image: response.data.item.album.images[0].url,
                      }
                    });
                  })
                  .catch(err => {
                    if(err.response.data.error.reason === 'PREMIUM_REQUIRED') {
                      return res.status(412).send({type: 'PREMIUM_REQUIRED'});
                    } else {
                      let message = 'Something went wrong, cannot play the song, is Mirra Web Player running?';
                      return res.status(500).send({message: message, error: err.response.statusText});
                    }
                  });
              })
              .catch(err => {
                let message = 'Something went wrong, cannot get user info';
                return res.status(500).send({message: message, error: err.response.statusText});
              });
          })
          .catch(err => {
            let message = 'Something went wrong, cannot get currently playing song';
            return res.status(500).json({message: message, error: err.response.statusText});
          });
      });
  }
};
