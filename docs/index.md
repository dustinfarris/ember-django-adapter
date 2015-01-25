# Ember Django Adapter Documentation

Ember Django Adapter (EDA) enables users to build applications using Django REST Framework and
Ember.js.  The two packages work with REST APIs, but differ on certain JSON formatting and
semantics.  Fortunately, Ember Data (the library powering Ember.js models) provides an opportunity
to write custom adapters to bridge these differences.  EDA is one such adapter specifically
designed to work with Django REST Framework.


## Requirements

To build a project using Ember Django Adapter, you will need to be using:

* Django REST Framwork >= 3.0
* Ember Data >= 1.0.0-beta.12
* Ember CLI >= 0.1.5


## Quickstart

In your Ember CLI project, install Ember Django Adapter from the command line:

```bash
ember install:addon ember-django-adapter
```

See [configuring](configuring.md) for more information on customizing the adapter.
