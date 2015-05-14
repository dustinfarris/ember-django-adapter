import Ember from 'ember';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import ENV from '../config/environment';

export default DRFAdapter.extend({
  host: Ember.computed(function() {
    return ENV.APP.API_HOST;
  }),

  namespace: Ember.computed(function() {
    return ENV.APP.API_NAMESPACE;
  })
});
