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

  init: function() {
    this._super();

    if (this.get('coalesceFindRequests')) {
      var error = "Please ensure coalesceFindRequests is not present or set " +
        "to false in your adapter. This adapter does not support the " +
        "coalesceFindRequests option. The Django REST Framework does not " +
        "offer easy to configure support for N+1 query requests in the " +
        "format that Ember Data uses (e.g. GET /comments?ids[]=1&ids[]=2) " +
        "See the Ember documentation about coalesceFindRequests for " +
        "information about this option: " +
        "http://emberjs.com/api/data/classes/DS.RESTAdapter.html#property_coalesceFindRequests";
      throw new Ember.Error(error);
    }
  },

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
   * @method buildURL
   * @param {String} type
   * @param {String} id
   * @param {DS.Model} record
   * @return {String} url
   */
  buildURL: function(type, id, record) {
    var url = this._super(type, id, record);
    if (url.charAt(url.length - 1) !== '/') {
      url += '/';
    }
    return url;
  }
});
