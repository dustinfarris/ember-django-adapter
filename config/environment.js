/*jshint node:true*/
'use strict';

module.exports = function(/* environment, appConfig */) {
  var ENV = {
    APP: {
      API_HOST: 'http://localhost:8000',
      API_NAMESPACE: 'api',
      API_ADD_TRAILING_SLASHES: true
    }
  };
  return ENV;
};
