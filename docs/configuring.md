# Configuring

There are a number of configuration variables you can set in your environment.js file.


## API_HOST

**Default:** `'http://localhost:8000'`

The fully-qualified host of your API server.


## API_NAMESPACE

**Default:** `'api'`

The URL prefix (namespace) for your API.  In other words, if you set this to my-api/v1, then all
API requests will look like /my-api/v1/users/56/, or similar.


## Example

```js
// my-ember-cli-project/config/environment.js

module.exports = function(environment) {
  var ENV = {
    APP: {
    }
  };

  if (environment === 'development') {
    ENV.APP.API_HOST = 'http://localhost:8000';
  }

  if (environment === 'production') {
    ENV.APP.API_HOST = 'https://api.myproject.com';
    ENV.APP.API_NAMESPACE = 'v2';
  }

  return ENV;
};
```
