DS.DjangoRESTAdapter = DS.RESTAdapter.extend({

  defaultSerializer: "DS/djangoREST",

  init: function() {
    this._super();

    if (this.get('coalesceFindRequests')) {
      var error = "Please ensure coalesceFindRequests is not present or set to false in your adapter. " +
        "This adapter does not support the coalesceFindRequests option. The Django REST Framework does not offer " +
        "easy to configure support for N+1 query requests in the format that Ember Data uses " +
        "(e.g. GET /comments?ids[]=1&ids[]=2)" +
        "See the Ember documentation about coalesceFindRequests for information about this option:" +
        "http://emberjs.com/api/data/classes/DS.RESTAdapter.html#property_coalesceFindRequests";
      throw new EmberError(error);
    }
  },

  pathForType: function(type) {
    var lowerCaseType = type.toLowerCase();
    return Em.String.pluralize(lowerCaseType);
  },

  buildURL: function(type, id, record) {
    var url = this._super(type, id, record);
    if (url.charAt(url.length - 1) !== '/') {
      url += '/';
    }
    return url;
  }
});
