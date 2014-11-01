import DRFAdapter from 'ember-django-adapter/adapters/drf';

export default DRFAdapter.extend({
  host: function() {
    return this.get('djangoAdapterConfig').apiHost;
  }.property('djangoAdapterConfig'),

  namespace: function() {
    return this.get('djangoAdapterConfig').apiNamespace;
  }.property('djangoAdapterConfig')
});
