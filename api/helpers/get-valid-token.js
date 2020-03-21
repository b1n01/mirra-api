const axios = require('axios');

module.exports = {
  friendlyName: 'Get a valid access token',

  description: 'Get a valid access token',

  inputs: {
    user: {
      type: 'ref',
      description: 'The current user',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Updated user',
    },
    error: {
      description: 'Something went wrong',
    }
  },

  fn: async function (inputs, exits) {
    let user = inputs.user;

    if(user.expiresAt > Date.now()) { // if already valid return
      return exits.success(user);
    }

    let refreshTokenUrl = 'https://accounts.spotify.com/api/token';
    let clientId = sails.config.custom.spotifyClientId;
    let clientSecret = sails.config.custom.spotifyClientSecret;
    let authToken =  Buffer.from(clientId + ':' + clientSecret).toString('base64');
    let bodyParam = `grant_type=refresh_token&refresh_token=${user.refreshToken}`;
    let options = { headers: {
      Authorization: 'Basic ' + authToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    }};

    axios.post(refreshTokenUrl, bodyParam, options)
      .then(async res => {
        let accessToken = res.data.access_token;
        let expiresIn = res.data.expires_in;
        let expiresAt = Date.now() + (expiresIn * 1000);
        let refreshToken = res.data.refresh_token;

        user = await User.updateOne({id: user.id}).set({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAt: expiresAt,
        });

        return exits.success(user);
      })
      .catch(err => {
        return exits.error(err);
      });
  }
};
