import DS from 'ember-data';

export default DS.DjangoRESTAdapter.extend({
  defaultSerializer: 'django',

  host: function() {
    return this.get('djangoAdapterConfig').apiHost;
  }.property('djangoAdapterConfig'),

  namespace: function() {
    return this.get('djangoAdapterConfig').apiNamespace;
  }.property('djangoAdapterConfig')
});
