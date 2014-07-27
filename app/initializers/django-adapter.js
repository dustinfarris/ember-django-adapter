export default {
  name: "django-adapter",

  initialize: function(container, app) {

    var getConfig = function(configKey, defaultValue) {
      if (typeof app.get(configKey) !== 'undefined') {
        return app.get(configKey);
      } else {
        return defaultValue;
      }
    };

    var djangoAdapterConfig = {
      apiHost: getConfig('API_HOST'),
      apiNamespace: getConfig('API_NAMESPACE', 'api')
    };

    app.register('config:djangoAdapterConfig', djangoAdapterConfig, { instantiate: false });
    app.inject('adapter', 'djangoAdapterConfig', 'config:djangoAdapterConfig');
  }
};
