import DRFAdapter from 'ember-django-adapter/adapters/drf';
import ENV from '../config/environment';

export default DRFAdapter.extend({
  host: function() {
    return ENV.APP.API_HOST;
  }.property(),

  namespace: function() {
    return ENV.APP.API_NAMESPACE;
  }.property(),

  add_trailing_slashes: function() {
    return ENV.APP.API_ADD_TRAILING_SLASHES;
  }.property()
});
