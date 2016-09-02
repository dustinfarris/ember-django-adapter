import DS from 'ember-data';
import Ember from 'ember';

const ERROR_MESSAGES = {
  401: 'Unauthorized',
  500: 'Internal Server Error'
};

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
  nonFieldErrorsKey: 'non_field_errors',


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
    Builds a URL for a given model name and optional ID.

    By default, it pluralizes the type's name (for example, 'post'
    becomes 'posts' and 'person' becomes 'people').

    If an ID is specified, it adds the ID to the path generated
    for the type, separated by a `/`.

    If the adapter has the property `addTrailingSlashes` set to
    true, a trailing slash will be appended to the result.

    @method buildURL
    @param {String} modelName
    @param {(String|Array|Object)} id single id or array of ids or query
    @param {(DS.Snapshot|Array)} snapshot single snapshot or array of snapshots
    @param {String} requestType
    @param {Object} query object of query parameters to send for query requests.
    @return {String} url
  */
  buildURL: function(modelName, id, snapshot, requestType, query) {
    var url = this._super(modelName, id, snapshot, requestType, query);
    if (this.get('addTrailingSlashes')) {
      if (url.charAt(url.length - 1) !== '/') {
        url += '/';
      }
    }
    return url;
  },

  /**
    Takes an ajax response, and returns the json payload or an error.

    By default this hook just returns the json payload passed to it.
    You might want to override it in two cases:

    1. Your API might return useful results in the response headers.
    Response headers are passed in as the second argument.

    2. Your API might return errors as successful responses with status code
    200 and an Errors text or object. You can return a `DS.InvalidError` or a
    `DS.AdapterError` (or a sub class) from this hook and it will automatically
    reject the promise and put your record into the invalid or error state.

    Returning a `DS.InvalidError` from this method will cause the
    record to transition into the `invalid` state and make the
    `errors` object available on the record. When returning an
    `DS.InvalidError` the store will attempt to normalize the error data
    returned from the server using the serializer's `extractErrors`
    method.

    @method handleResponse
    @param  {Number} status
    @param  {Object} headers
    @param  {Object} payload
    @return {Object | DS.AdapterError} response
  */
  handleResponse: function(status, headers, payload) {
    if (this.isSuccess(status, headers, payload)) {
      return payload;
    } else if (this.isInvalid(status, headers, payload)) {
      return new DS.InvalidError(this._drfToJsonAPIValidationErrors(payload));
    }

    if (Object.getOwnPropertyNames(payload).length === 0) {
      payload = '';
    } else if (payload.detail) {
      payload = payload.detail;
    }
    let errors = this.normalizeErrorResponse(status, headers, payload);

    if (ERROR_MESSAGES[status]) {
      return new DS.AdapterError(errors, ERROR_MESSAGES[status]);
    }
    return new DS.AdapterError(errors);
  },

  isInvalid: function(status) {
    return status === 400;
  },

  /**
    Convert validation errors to a JSON API object.

    Non-field errors are converted to an object that points at /data.  Field-
    specific errors are converted to an object that points at the respective
    attribute.  Nested field-specific errors are converted to an object that
    include a slash-delimited pointer to the nested attribute.

    NOTE: Because JSON API does not technically support nested resource objects
          at this time, any nested errors are literally "in name" only.  The
          error object will be attached to the parent resource and the nested
          object's isValid property will continue to be true.

    @method _drfToJsonAPIValidationErrors
    @param {Object} payload
    @param {String} keyPrefix Used to recursively process nested errors
    @return {Array} A list of JSON API compliant error objects
  */
  _drfToJsonAPIValidationErrors(payload, keyPrefix='') {
    let out = [];

    payload = this._formatPayload(payload);

    for (let key in payload) {
      /*jshint loopfunc: true */
      if (payload.hasOwnProperty(key)) {
        if (Ember.isArray(payload[key])) {
          payload[key].forEach(error => {
            if (key === this.get('nonFieldErrorsKey')) {
              out.push({
                source: { pointer: '/data' },
                detail: error,
                title: 'Validation Error'
              });
            } else {
              out.push({
                source: { pointer: `/data/attributes/${keyPrefix}${key}` },
                detail: error,
                title: 'Invalid Attribute'
              });
            }
          });
        } else {
          out = out.concat(
            this._drfToJsonAPIValidationErrors(payload[key], `${keyPrefix}${key}/`)
          );
        }
      }
    }
    return out;
  },

  /**
   * This is used by RESTAdapter._drfToJsonAPIValidationErrors.
   *
   * Map string values to arrays because improperly formatted payloads cause
   * a maximum call stack size exceeded error
   *
   * @method _formatPayload
   * @param {Object} payload
   * @return {Object} payload
   */
  _formatPayload: function(payload) {
    for (let key in payload) {
      if (payload.hasOwnProperty(key)) {
        if (typeof payload[key] === 'string') {
          payload[key] = [payload[key]];
        }
      }
    }

    return payload;
  },

  /**
   * This is used by RESTAdapter.groupRecordsForFindMany.
   *
   * The original implementation does not handle trailing slashes well.
   * Additionally, it is a complex stripping of the id from the URL,
   * which can be dramatically simplified by just returning the base
   * URL for the type.
   *
   * @method _stripIDFromURL
   * @param {DS.Store} store
   * @param {DS.Snapshot} snapshot
   * @return {String} url
   */
  _stripIDFromURL: function(store, snapshot) {
    return this.buildURL(snapshot.modelName);
  }
});
