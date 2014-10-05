Ember Django Adapter
====================

This Ember addon enables the use of [Django REST Framework][] as an API
backend.  The core functionality of the adapter is in
[toranb/ember-data-django-rest-adapter][].  The addon is compatible with
[ember-cli][] version 0.1.0 and higher.


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
  ENV.APP.API_NAMESPACE = 'api';
}

if (environment === 'production') {
  ENV.APP.API_HOST = 'https://api.myproject.org';
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

For examples extending the adapter, see [the cookbook][].



[Django REST Framework]: http://www.django-rest-framework.org/
[toranb/ember-data-django-rest-adapter]: https://github.com/toranb/ember-data-django-rest-adapter
[ember-cli]: http://www.ember-cli.com/
[ember-django-adapter/issues]: https://github.com/dustinfarris/ember-django-adapter/issues
[the cookbook]: https://github.com/dustinfarris/ember-django-adapter/wiki/Cookbook
