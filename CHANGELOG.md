ember-django-adapter Changelog
==============================


Master
------


0.5.5
------
* [INTERNAL] Updated ember-cli version to latest (0.2.4)
  ([#89](https://github.com/dustinfarris/ember-django-adapter/pull/89))
* [BUGFIX] All find queries are now handled properly
  ([#88](https://github.com/dustinfarris/ember-django-adapter/pull/88))


0.5.4
-----

* [INTERNAL] Updated ember-cli version to latest (0.2.3)
  ([#81](https://github.com/dustinfarris/ember-django-adapter/pull/81))
* [ENHANCEMENT] Modified signatures of methods in serializer and adapter
  to comply with changes introduced in ember-data v1.0.0-beta.15 and in
  v1.0.0-beta.16 (snapshots instead of records)
  ([#74](https://github.com/dustinfarris/ember-django-adapter/pull/74))
  ([#77](https://github.com/dustinfarris/ember-django-adapter/pull/77))
  ([#84](https://github.com/dustinfarris/ember-django-adapter/pull/84))
* [INTERNAL] Use ember-try to enable a test matrix
  ([#85](https://github.com/dustinfarris/ember-django-adapter/pull/85))


0.5.3
-----

* [BREAKING ENHANCEMENT] Remove trailing slashes environment config
  ([#67](https://github.com/dustinfarris/ember-django-adapter/pull/67))
* [DOCS] Add Google Analytics to documentation site
  ([#69](https://github.com/dustinfarris/ember-django-adapter/pull/69))
* [ENHANCEMENT] Support added for coalesceFindRequests
  ([#68](https://github.com/dustinfarris/ember-django-adapter/pull/68))
* [INTERNAL] Revised goals for the adapter
  ([#70](https://github.com/dustinfarris/ember-django-adapter/pull/70))


0.5.2
-----

* [BUGFIX] Return jqXHR for non-400 errors
  ([#62](https://github.com/dustinfarris/ember-django-adapter/pull/62))
* [BREAKING BUGFIX] Set default host to localhost:8000
  ([#64](https://github.com/dustinfarris/ember-django-adapter/pull/64))
* [DOCS] Update installation instructions
  ([#65](https://github.com/dustinfarris/ember-django-adapter/pull/65))


0.5.1
-----

* [ENHANCEMENT] Add support for pagination metadata
  ([#45](https://github.com/dustinfarris/ember-django-adapter/pull/45))
* [ENHANCEMENT] Add documentation for contributing
  ([#49](https://github.com/dustinfarris/ember-django-adapter/pull/49))
* [ENHANCEMENT] Add blueprints and support for embedded records
  ([#51](https://github.com/dustinfarris/ember-django-adapter/pull/51))
* [ENHANCEMENT] Add option to remove trailing slashes
  ([#50](https://github.com/dustinfarris/ember-django-adapter/pull/50))
* [ENHANCEMENT] Test coverage for all supported versions of ember-data
  ([#56](https://github.com/dustinfarris/ember-django-adapter/pull/56))


0.5.0
-----

* [BREAKING REFACTOR] Rewrite [toranb/ember-data-django-rest-adapter][] as an ember-cli addon



[toranb/ember-data-django-rest-adapter]: https://github.com/toranb/ember-data-django-rest-adapter
