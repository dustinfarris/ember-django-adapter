/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-django-adapter',

  included: function(app) {
    this._super.included(app);

    app.import('vendor/ember-django-adapter/register-version.js');
  }
};
