import DS from 'ember-data';

export default DS.DjangoRESTAdapter.extend({
  host: function() {
    return this.get('djangoAdapterConfig').apiHost;
  }.property('djangoAdapterConfig'),
  defaultSerializer: 'django'
});
