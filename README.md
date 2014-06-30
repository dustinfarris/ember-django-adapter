# Ember Django Adapter

This Ember addon enables the use of [Django REST Framework][] as an API backend.  The core functionality of the addon is
in [toranb/ember-data-django-rest-adapter][].

## Installation

From within your Ember CLI application (must be >= 0.0.37), run the following:

```console
npm i --save-dev ember-django-adapter
```

## Configuration

In your app settings in `config/environment.js`, set the hostname for your API, e.g.:

```js
if (environment === 'development') {
  ENV.APP.API_HOST = 'http://localhost:8000';
}

if (environment === 'production') {
  ENV.APP.API_HOST = 'https://api.myproject.org';
}
```

If no API host is set, the adapter will use http://localhost:8000 by default.


[Django REST Framework]: http://www.django-rest-framework.org/
[toranb/ember-data-django-rest-adapter]: https://github.com/toranb/ember-data-django-rest-adapter
