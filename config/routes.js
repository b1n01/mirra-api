/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'GET /authorize': 'AuthController.authorize',
  'GET /redirect': 'AuthController.redirect',
  'GET /access-token': 'AuthController.accessToken',

  'GET /share': 'MainController.share',
  'GET /play': 'MainController.play',
};
