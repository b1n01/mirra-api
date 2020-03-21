/**
 * MainController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');

module.exports = {
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
        return res.send({'share-key': user.key});
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
      return res.status(401).json({message: 'Wrong parameters'});
    }

    User.findOne({key: userKey})
    .then(user => {
      if(!user) {
        return res.status(401).json({message: 'User not found'});
      }

      let getCurrentlyPlayinfUrl = 'https://api.spotify.com/v1/me/player/currently-playing';
      let options = {headers: {
        Authorization: 'Bearer ' + user.accessToken,
      }};

      axios.get(getCurrentlyPlayinfUrl, options)
      .then(response => {

        sails.log(response);
        if(!response.data) {
          return res.status(401).json({
            message: 'Something went wrong, cannot get currently playing song',
            type: 'USER_NOT_ONLINE'
          });
        }

        let songUri = response.data.item.uri;
        let playUri = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
        let config = JSON.stringify({uris: [songUri]});
        let options = {headers: {
          Authorization: 'Bearer ' + req.user.accessToken,
        }};

        axios.put(playUri, config, options)
        .then(() => {
          return res.json({message: 'ok'});
        }).catch(err => {
          sails.log('error', err.response);
          return res.status(500).json({
            message: 'Something went wrong, cannot play the song, is Mirra Web Player running?',
            error: err.message
          });
        });
      }).catch(err => {
        sails.log('error', err.response);
        return res.status(401).json({
          message: 'Something went wrong, cannot get currently playing song',
          error: err.message
        });
      });
    });
  }
};
