/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    key: { type: 'string', required: true },
    spotifyId: { type: 'string', allowNull: true },
    public: { type: 'boolean', defaultsTo: false },
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    expiresAt: { type: 'string' },
  },
};

