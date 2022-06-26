# Mirra API

This is the Mirra api server repo.

### Up and running

Clone and run `npm install`.

Update `conf/local.js` by adding your local databse like: 
```
adapter: require('sails-mysql'),
url: 'mysql://password:username@localhost:port/db-name',
```

Serve with `sails lift` it will run on default [localhost:1337](http://localhost:1337). 

## Watch 

To livereload the server use `forever -w app.js` (you need DB to run app)

## Debug

Run `sails inspect` and use chrome devtool to inspect code

## Development

It is developed using [SailsJS](https://sailsjs.com).

## App

There is a client using this api, check it out [here](https://github.com/b1n01/mirra-app)

## Note

This is just a proof of concept, development has been stopped for many years now.
