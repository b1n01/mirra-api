const  jwt = require('jsonwebtoken');

/**
 * Check if user is authenticated by checking the authorization jwt.
 * If authorized set user on req.user
 */
module.exports = function(req, res, next) {
  var token = req.headers['authorization'];

  if(!token) {
    return res.json({message: 'Missing token'}).status(401);
  }

  token = token.split(' ')[1];

  jwt.verify(token, sails.config.custom.secret, {}, (err, data) => {
    if(err) {
      return res.json({message: 'Wrong token'}).status(401);
    }

    sails.models.user.findOne({id: data.userId}, (err, user) => {
      if(err) {
        return res.json({message: 'User not found'}).status(404);
      }

      req.user = user;
      next();
    });
  });
};
