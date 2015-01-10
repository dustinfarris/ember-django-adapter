Ember Django Adapter
====================

[![Circle CI](https://circleci.com/gh/dustinfarris/ember-django-adapter/tree/version-1.0.png?style=badge)](https://circleci.com/gh/dustinfarris/ember-django-adapter/tree/version-1.0)

This Ember addon enables the use of [Django REST Framework][] as an API
backend. The addon is compatible with [ember-cli][] version 0.1.0 and
higher and Ember Data v1.0.0-beta.12.

Goals
-----

* Ability to support Django REST Framework APIs without modifications to the default configuration of Django REST
  Framework.

* Ensure as much as possible that the documentation on emberjs.com about adapters and serializers is accurate and
  relevant when using the Django REST adapter and serializer. Deviations from the emberjs.com documentation should be
  documented clearly.

* Optionally enable some features from Django REST Framework which would require users to setup or configure their APIs
  in a specific manner. An example of this is retrieving hasMany records using query params as configured with Django
  REST Framework and django-filter.


Community
---------

* IRC: #ember-django-adapter on freenode
* Issues: [ember-django-adapter/issues][]


Installation
------------

From within your Ember CLI application, run the following:

```console
npm i --save-dev ember-django-adapter
```


Configuration
-------------

In your app settings in `config/environment.js`, set the hostname for your API,
e.g.:

```js
if (environment === 'development') {
  ENV.APP.API_HOST = 'http://localhost:8000';
}

if (environment === 'production') {
  ENV.APP.API_HOST = 'https://api.myproject.org';
  ENV.APP.API_NAMESPACE = '';
}
```

### Configuration Options

* API_HOST: The server hosting your API _(default: None)_
* API_NAMESPACE: Your API namespace _(default: 'api')_


Extending
---------

Installing the adapter and setting `API_HOST` should satisfy most requirements,
but if you want to add your own customizations:

### Custom Adapter

```console
ember generate django-adapter my-custom-adapter
```

### Custom Serializer

```console
ember generate django-serializer my-custom-serializer
```

## Path Customization

By default the `DRFAdapter` will attempt to pluralize and
dasherize the  model name to generate the path name. This allows the
convention of URLs in Django. If this convention is not suitable for
your needs, you can override the pathForType method.

For example, if you do not want to pluralize and dasherize the model
names and needed underscore_case instead, you would override the
pathForType method like this:

```js
App.ApplicationAdapter = DS.DjangoRESTAdapter.extend({
  pathForType: function(type) {
    return Ember.String.underscore(type);
  }
});
```

Requests for App.User would now target /user/1. Requests for App.UserProfile would now target /user_profile/1.


## coalesceFindRequests option

This adapter does not support the coalesceFindRequests option. The Django REST Framework does not offer easy to
configure support for N+1 query requests in the format that Ember Data uses (e.g. `GET /comments?ids[]=1&ids[]=2`)

See the Ember documentation about coalesceFindRequests for information about this option [coalesce-find-requests-option][].


## More Examples

For other examples extending the adapter, see [the cookbook][].

[Django REST Framework]: http://www.django-rest-framework.org/
[ember-cli]: http://www.ember-cli.com/
[ember-django-adapter/issues]: https://github.com/dustinfarris/ember-django-adapter/issues
[coalesce-find-requests-option]: http://emberjs.com/api/data/classes/DS.RESTAdapter.html#property_coalesceFindRequests
[the cookbook]: https://github.com/dustinfarris/ember-django-adapter/wiki/Cookbook
