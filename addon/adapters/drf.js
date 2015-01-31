import DS from 'ember-data';
import Ember from 'ember';

/**
 * The Django REST Framework adapter allows your store to communicate
 * with Django REST Framework-built APIs by adjusting the JSON and URL
 * structure implemented by Ember Data to match that of DRF.
 *
 * The source code for the RESTAdapter superclass can be found at:
 * https://github.com/emberjs/data/blob/master/packages/ember-data/lib/adapters/rest_adapter.js
 *
 * @class DRFAdapter
 * @constructor
 * @extends DS.RESTAdapter
 */
export default DS.RESTAdapter.extend({
  defaultSerializer: "DS/djangoREST",
  addTrailingSlashes: true,
  coalesceFindRequests: false,

  /**
   * Determine the pathname for a given type.
   *
   * @method pathForType
   * @param {String} type
   * @return {String} path
   */
  pathForType: function(type) {
    var dasherized = Ember.String.dasherize(type);
    return Ember.String.pluralize(dasherized);
  },

  /**
   * Build a URL for a given type and optional ID.
   *
   * By default, it pluralizes the type's name (for example, 'post'
   * becomes 'posts' and 'person' becomes 'people').
   *
   * If an ID is specified, it adds the ID to the path generated for
   * the type, separated by a `/`.
   *
   * If the adapter has the property `addTrailingSlashes` set to
   * true, a trailing slash will be appended to the result.
   *
   * @method buildURL
   * @param {String} type
   * @param {String} id
   * @param {DS.Model} record
   * @return {String} url
   */
  buildURL: function(type, id, record) {
    var url = this._super(type, id, record);
    if (this.get('addTrailingSlashes')) {
      if (url.charAt(url.length - 1) !== '/') {
        url += '/';
      }
    }
    return url;
  },

  /**
   * Takes an ajax response, and returns an error payload.
   *
   * Returning a `DS.InvalidError` from this method will cause the
   * record to transition into the `invalid` state and make the
   * `errors` object available on the record.
   *
   * This function should return the entire payload as received from the
   * server. Error object extraction and normalization of model errors
   * should be performed by `extractErrors` on the serializer.
   *
   * @method ajaxError
   * @param  {Object} jqXHR
   * @return {DS.InvalidError} or {Object} jqXHR
   */
  ajaxError: function(jqXHR) {
    var error = this._super(jqXHR);

    if (jqXHR && jqXHR.status === 400) {

      var jsonErrors;
      try {
        jsonErrors = Ember.$.parseJSON(jqXHR.responseText);
      } catch (SyntaxError) {
        // This happens with some errors (e.g. 500).
        return error;
      }

      // The field errors need to be in an `errors` hash to ensure
      // `extractErrors` / `normalizeErrors` functions get called
      // on the serializer.
      var convertedJsonErrors = {};
      convertedJsonErrors['errors'] = jsonErrors;
      return new DS.InvalidError(convertedJsonErrors);

    } else {
      return error;
    }
  },

  /**
   * This is used by RESTAdapter.groupRecordsForFindMany.
   *
   * The original implementation is a complex stripping of the id from
   * the URL, which can be dramatically simplified by just returning
   * the base URL for the type.
   *
   * @method _stripIDFromURL
   * @param {DS.Store} store
   * @param {DS.Model} record
   * @return {String} url
   */
  _stripIDFromURL: function(store, record) {
    return this.buildURL(record.constructor.typeKey);
  }
});
