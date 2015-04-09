import DS from 'ember-data';
import Ember from 'ember';

/**
 * Handle JSON/REST (de)serialization.
 *
 * This serializer adjusts payload data so that it is consumable by
 * Django REST Framework API endpoints.
 *
 * @class DRFSerializer
 * @extends DS.RESTSerializer
 */
export default DS.RESTSerializer.extend({

  /**
   *  Returns the number extracted from the page number query param of
   *  a `url`. `null` is returned when the page number query param
   *  isn't present in the url. `null` is also returned when `url` is
   *  `null`.
   *
   * @method extractPageNumber
   * @private
   * @param {String} url
   * @return {Number} page number
   */
  extractPageNumber: function(url) {
    var match = /.*?[\?&]page=(\d+).*?/.exec(url);
    if (match) {
      return Number(match[1]).valueOf();
    }
    return null;
  },

  /**
   * `extractMeta` is used to deserialize any meta information in the
   * adapter payload. By default Ember Data expects meta information to
   * be located on the `meta` property of the payload object.
   *
   * @method extractMeta
   * @param {DS.Store} store
   * @param {subclass of DS.Model} type
   * @param {Object} payload
   */
  extractMeta: function(store, type, payload) {
    if (payload && payload.results) {
      // Sets the metadata for the type.
      store.setMetadataFor(type, {
        count: payload.count,
        next: this.extractPageNumber(payload.next),
        previous: this.extractPageNumber(payload.previous)
      });

      // Keep ember data from trying to parse the metadata as a records
      delete payload.count;
      delete payload.next;
      delete payload.previous;
    }
  },

  /**
   * `extractSingle` is used to deserialize a single record returned
   * from the adapter.
   *
   * @method extractSingle
   * @param {DS.Store} store
   * @param {subclass of DS.Model} type
   * @param {Object} payload
   * @param {String or Number} id
   * @return {Object} json The deserialized payload
   */
  extractSingle: function(store, type, payload, id) {
    var convertedPayload = {};
    convertedPayload[type.typeKey] = payload;
    return this._super(store, type, convertedPayload, id);
  },

  /**
   * `extractArray` is used to deserialize an array of records
   * returned from the adapter.
   *
   * @method extractArray
   * @param {DS.Store} store
   * @param {subclass of DS.Model} type
   * @param {Object} payload
   * @param {String or Number} id
   * @return {Array} array An array of deserialized objects
   */
  extractArray: function(store, type, payload) {
    // Convert payload to json format expected by the RESTSerializer.
    // This function is being overridden instead of normalizePayload()
    // because `results` will only be in lists.
    var convertedPayload = {};
    if (payload.results) {
      convertedPayload[type.typeKey] = payload.results;
    } else {
      convertedPayload[type.typeKey] = payload;
    }
    return this._super(store, type, convertedPayload);
  },

  /**
   * You can use this method to customize how a serialized record is
   * added to the complete JSON hash to be sent to the server. By
   * default the JSON Serializer does not namespace the payload and
   * just sends the raw serialized JSON object.
   *
   * If your server expects namespaced keys, you should consider using
   * the RESTSerializer.  Otherwise you can override this method to
   * customize how the record is added to the hash.
   *
   * For example, your server may expect underscored root objects.
   *
   * @method serializeIntoHash
   * @param {Object} hash
   * @param {subclass of DS.Model} type
   * @param {DS.Snapshot} snapshot
   * @param {Object} options
   */
  serializeIntoHash: function(hash, type, snapshot, options) {
    Ember.merge(hash, this.serialize(snapshot, options));
  },

  /**
   * `keyForAttribute` can be used to define rules for how to convert
   * an attribute name in your model to a key in your JSON.
   *
   * @method keyForAttribute
   * @param {String} key
   * @return {String} normalized key
   */
  keyForAttribute: function(key) {
    return Ember.String.decamelize(key);
  },

  /**
   * `keyForRelationship` can be used to define a custom key when
   * serializing relationship properties. By default `JSONSerializer`
   * does not provide an implementation of this method.
   *
   * @method keyForRelationship
   * @param {String} key
   * @param {String} type The type of relationship
   * @return {String} normalized key
   */
  keyForRelationship: function(key) {
    return Ember.String.decamelize(key);
  }
});
