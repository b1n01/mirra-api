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

### Links

+ [Sails framework documentation](https://sailsjs.com/get-started)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)


### Version info

This app was originally generated on Thu Mar 19 2020 10:22:55 GMT+0100 (GMT+01:00) using Sails v1.2.3.
