/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');

module.exports = {

  /**
   * Redirect to Spotify authorization endpoint
   *
   * @param {*} req
   * @param {*} res
   */
  authorize: function (req, res) {
    let clientId = sails.config.custom.spotifyClientId;
    let scope = 'streaming,user-read-email,user-read-private' // to create device with Web Playback SDK
      +',user-read-playback-state' // to check if user is listening
      +',user-modify-playback-state' // to play songs
      +',user-read-recently-played'; // to get last played songs
    let redirectUri = sails.config.custom.serverHost + '/redirect';

    let url = 'https://accounts.spotify.com/authorize'
      + `?client_id=${clientId}`
      + `&response_type=code`
      + `&redirect_uri=${redirectUri}`
      // + `&state=hashed cookie` // TODO set state
      + `&scope=${scope}`;

    return res.redirect(url);
  },

  /**
   * Handle the redirect back from Spotify authorization flow. It takes the code
   * from the query string and ask for tokens (access, refresh ecc..).
   *
   * @param {*} req
   * @param {*} res
   */
  redirect: function(req, res) {
    let error = req.param('error', null);
    let code = req.param('code', null);

    if(error === 'access_denied' || !code) {
      return res.json({message: 'You have to allow access'});
    }

    //req.param('state', null); // TODO check state

    let clientId = sails.config.custom.spotifyClientId;
    let clientSecret = sails.config.custom.spotifyClientSecret;
    let tokenUri = 'https://accounts.spotify.com/api/token';
    let redirectUri = sails.config.custom.serverHost + '/redirect';

    let authToken =  Buffer.from(clientId + ':' + clientSecret).toString('base64');
    let bodyParam = `grant_type=authorization_code&redirect_uri=${redirectUri}&code=${code}`;
    let options = { headers: {
      Authorization: 'Basic ' + authToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    }};

    // With the 'code' ask form the 'access token' and 'refresh token'
    axios.post(tokenUri, bodyParam, options)
      .then(async response => {
        let accessToken = response.data.access_token;
        let expiresIn = response.data.expires_in;
        let expiresAt = Date.now() + (expiresIn * 1000);
        let refreshToken = response.data.refresh_token;

        let getUserInfoUrl = 'https://api.spotify.com/v1/me';
        let options = { headers: {
          Authorization: 'Bearer ' + accessToken,
        }};

        // With the 'access token' ask for user info
        axios.get(getUserInfoUrl, options)
          .then(async response => {
            let spotifyId = response.data.id;
            let user = await User.findOne({
              spotifyId: spotifyId,
            });

            if(!user) {
              // Create new user
              let userKey = shortid.generate();

              user = await User.create({
                spotifyId: spotifyId,
                key: userKey,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresAt: expiresAt,
              }).fetch();
            } else {
              // Update existing user
              user = await User.updateOne({id: user.id}).set({
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresAt: expiresAt,
              });
            }

            let jwtToken = jwt.sign({userId: user.id}, sails.config.custom.secret);
            return res.cookie('jwt', jwtToken).redirect(sails.config.custom.appHost + '/auth');
          })
          .catch(() => {
            let message = 'Something went wrong, cannot found the user on remote server';
            return res.status(500).send({message: message});
          });

      })
      .catch(() => {
        let message = 'Something went wrong, cannot get access token from';
        return res.status(500).send({message: message});
      });
  },

  /**
   * Get a valid user access token
   *
   * @param {*} req
   * @param {*} res
   */
  accessToken: async function(req, res) {
    sails.helpers.getValidToken.with({user: req.user})
      .then(user => res.send({'access_token': user.accessToken}))
      .catch(err => res.status(500).send({'error': err.message}));
  },

  /**
   * Delete User account
   * 
   * @param {*} req
   * @param {*} res
   */
  delete: async function(req, res) {
    await User.destroyOne({id: req.user.id});
    res.json({message: 'ok'});
  }
};
