module.exports = {
  name: 'Ember Django Adapter',
  included: function(app) {
    app.import({
      development: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.js',
      production: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.prod.js'
    });
  }
};
