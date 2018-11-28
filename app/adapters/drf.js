import { computed } from '@ember/object';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import ENV from '../config/environment';

export default DRFAdapter.extend({
  host: computed(function() {
    return ENV.APP.API_HOST;
  }),

  namespace: computed(function() {
    return ENV.APP.API_NAMESPACE;
  })
});
