Ember Django Adapter
====================

[![Circle CI](https://circleci.com/gh/dustinfarris/ember-django-adapter/tree/master.png?style=badge)](https://circleci.com/gh/dustinfarris/ember-django-adapter/tree/master)

This Ember addon enables the use of [Django REST Framework][] as an API
backend. The addon is compatible with [ember-cli][] version 0.1.5 and
higher and Ember Data v1.0.0-beta.12.


Community
---------

* IRC: #ember-django-adapter on freenode
* Issues: [ember-django-adapter/issues][]
* Website: [dustinfarris.com/ember-django-adapter][]


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



[Django REST Framework]: http://www.django-rest-framework.org/
[ember-cli]: http://www.ember-cli.com/
[ember-django-adapter/issues]: https://github.com/dustinfarris/ember-django-adapter/issues
[dustinfarris.com/ember-django-adapter]: http://dustinfarris.com/ember-django-adapter/
[coalesce-find-requests-option]: http://emberjs.com/api/data/classes/DS.RESTAdapter.html#property_coalesceFindRequests
