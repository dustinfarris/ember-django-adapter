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
  // Remove this in our 2.0 release.
  isNewSerializerAPI: true,

  /**
   * Returns the resource's relationships formatted as a JSON-API "relationships object".
   *
   * http://jsonapi.org/format/#document-resource-object-relationships
   *
   * This version adds a 'links'hash with relationship urls before invoking the
   * JSONSerializer's version.
   *
   * @method extractRelationships
   * @param {Object} modelClass
   * @param {Object} resourceHash
   * @return {Object}
   */
  extractRelationships: function (modelClass, resourceHash) {
    if (!resourceHash.hasOwnProperty('links')) {
      resourceHash['links'] = {};
    }

    modelClass.eachRelationship(function(key, relationshipMeta) {
      let payloadRelKey = this.keyForRelationship(key);

      if (!resourceHash.hasOwnProperty(payloadRelKey)) {
        return;
      }

      if (relationshipMeta.kind === 'hasMany' || relationshipMeta.kind === 'belongsTo') {
        // Matches strings starting with: https://, http://, //, /
        var payloadRel = resourceHash[payloadRelKey];
        if (!Ember.isNone(payloadRel) && !Ember.isNone(payloadRel.match) &&
          typeof(payloadRel.match) === 'function' && payloadRel.match(/^((https?:)?\/\/|\/)\w/)) {
          resourceHash['links'][key] = resourceHash[payloadRelKey];
          delete resourceHash[payloadRelKey];
        }
      }
    }, this);

    return this._super(modelClass, resourceHash);
  },

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
   * Converts DRF API server responses into the format expected by the RESTSerializer.
   *
   * If the payload has DRF metadata and results properties, all properties that aren't in
   * the results are added to the 'meta' hash so that Ember Data can use these properties
   * for metadata. The next and previous pagination URLs are parsed to make it easier to
   * paginate data in applications. The RESTSerializer's version of this function is called
   * with the converted payload.
   *
   * @method normalizeResponse
   * @param {DS.Store} store
   * @param {DS.Model} primaryModelClass
   * @param {Object} payload
   * @param {String|Number} id
   * @param {String} requestType
   * @return {Object} JSON-API Document
   */
  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
    let convertedPayload = {};

    if (!Ember.isNone(payload) &&
      payload.hasOwnProperty('next') &&
      payload.hasOwnProperty('previous') &&
      payload.hasOwnProperty('results')) {

      // Move DRF metadata to the meta hash.
      convertedPayload[primaryModelClass.modelName] = JSON.parse(JSON.stringify(payload.results));
      delete payload.results;
      convertedPayload['meta'] = JSON.parse(JSON.stringify(payload));

      // The next and previous pagination URLs are parsed to make it easier to paginate data in applications.
      if (!Ember.isNone(convertedPayload.meta['next'])) {
        convertedPayload.meta['next'] = this.extractPageNumber(convertedPayload.meta['next']);
      }
      if (!Ember.isNone(convertedPayload.meta['previous'])) {
        let pageNumber = this.extractPageNumber(convertedPayload.meta['previous']);
        // The DRF previous URL doesn't always include the page=1 query param in the results for page 2. We need to
        // explicitly set previous to 1 when the previous URL is defined but the page is not set.
        if (Ember.isNone(pageNumber)) {
           pageNumber = 1;
        }
        convertedPayload.meta['previous'] = pageNumber;
      }
    } else {
      convertedPayload[primaryModelClass.modelName] = JSON.parse(JSON.stringify(payload));
    }

    return this._super(store, primaryModelClass, convertedPayload, id, requestType);
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
   * @return {String} normalized key
   */
  keyForRelationship: function(key) {
    return Ember.String.decamelize(key);
  }
});
