'use strict';

module.exports = function(/* environment, appConfig */) {
  var ENV = {
    APP: {
      API_HOST: '',
      API_NAMESPACE: 'api',
      API_ADD_TRAILING_SLASHES: true
    }
  };
  return ENV;
};
