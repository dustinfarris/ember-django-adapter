import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTAdapter.extend({

  defaultSerializer: "-drf",

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

  // TODO: Test with 500 error (and other errors).
  ajaxError: function(jqXHR) {
    var error = this._super(jqXHR);

    if (jqXHR && jqXHR.status !== undefined && jqXHR.responseText !== undefined) {
      var response = Ember.$.parseJSON(jqXHR.responseText);

      if (jqXHR.status === 400) {
        var errors = {};
        forEach(Ember.keys(response), function(key) {
          errors[Ember.String.camelize(key)] = response[key];
        });
        return new DS.InvalidError(errors);

      } else if (jqXHR && jqXHR.status === 403) {
        return new Error(response['detail']);
      }
    } else {
      return error;
    }
  },

  pathForType: function(type) {
    var lowerCaseType = type.toLowerCase();
    return Ember.String.pluralize(lowerCaseType);
  },

  buildURL: function(type, id, record) {
    var url = this._super(type, id, record);
    if (url.charAt(url.length - 1) !== '/') {
      url += '/';
    }
    return url;
  }
});
