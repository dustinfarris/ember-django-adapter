
DS.DjangoRESTSerializer = DS.RESTSerializer.extend({

  extractMeta: function(store, type, payload) {
    if (payload && payload.results) {
      // Sets the metadata for the type.
      store.metaForType(type, { total: payload.count, next: payload.next, previous: payload.previous });
      // Keeps ember data from trying to parse the metadata as a records.
      delete payload.count;
      delete payload.next;
      delete payload.previous
    }
  },

  extractArray: function(store, primaryType, rawPayload) {
    // Convert rawPayload to json format expected by the RESTSerializer.
    var payload = {};
    payload[primaryType.typeKey] = rawPayload['results'] ? rawPayload['results'] : rawPayload;
    return this._super(store, primaryType, payload);
  },

  keyForAttribute: function(attr) {
    return Em.String.decamelize(attr);
  },

  keyForRelationship: function(rawKey, kind) {
    return Em.String.decamelize(rawKey);
  }
});
