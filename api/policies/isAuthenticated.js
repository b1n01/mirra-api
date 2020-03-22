const  jwt = require('jsonwebtoken');

/**
 * Check if user is authenticated by checking the authorization jwt.
 * If authorized set user on req.user
 */
module.exports = function(req, res, next) {
  var token = req.headers['authorization'];

  if(!token) {
    return res.status(401).send({message: 'Missing token'});
  }

  token = token.split(' ')[1];

  jwt.verify(token, sails.config.custom.secret, {}, (err, data) => {
    if(err) {
      return res.status(401).send({message: 'Wrong token'});
    }

    sails.models.user.findOne({id: data.userId}, (err, user) => {
      if(err || !user) {
        return res.status(401).send({message: 'User not found'});
      }

      req.user = user;
      next();
    });
  });
};
