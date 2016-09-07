ember-django-adapter Changelog
==============================


Master
------


1.1.3
-----

* [INTERNAL] Upgrade ember-cli to 1.13.15
  ([#157](https://github.com/dustinfarris/ember-django-adapter/pull/157))
* [ENHANCEMENT] Allow addon to be used in a another addon
  ([#164](https://github.com/dustinfarris/ember-django-adapter/pull/164))
* [BUGFIX] Map payload strings to arrays
  ([#165](https://github.com/dustinfarris/ember-django-adapter/pull/165))


1.1.2
-----

* [ENHANCMENT] Register addon with Ember libraries
  ([#142](https://github.com/dustinfarris/ember-django-adapter/pull/142))
* [BUGFIX] Do not check for count attribute in paginated response
  ([#143](https://github.com/dustinfarris/ember-django-adapter/pull/143))
* [DOCS] Note to disable pagination for coalesced records
  ([#145](https://github.com/dustinfarris/ember-django-adapter/pull/145))


1.1.1
-----

* [BUGFIX] Support nested errors returned by DRF
  ([#141](https://github.com/dustinfarris/ember-django-adapter/pull/141))
* [BUGFIX] Do not require page query param on pagination previous link
  ([#140](https://github.com/dustinfarris/ember-django-adapter/pull/140))
* [INTERNAL] Upgrade ember and ember-cli to latest
  ([#138](https://github.com/dustinfarris/ember-django-adapter/pull/138))


1.1.0
-----

* [ENHANCEMENT] Extend DS.RESTSerializer
  ([#133](https://github.com/dustinfarris/ember-django-adapter/pull/133))


1.0.0
-----

* [BREAKING ENHANCEMENT] Update to new Ember Data 1.13 serializer API
  ([#114](https://github.com/dustinfarris/ember-django-adapter/pull/114))
* [ENHANCEMENT] Support ember-data 1.13 series
  ([#108](https://github.com/dustinfarris/ember-django-adapter/pull/108))
* [ENHANCEMENT] Support HyperlinkedRelatedFields
  ([#95](https://github.com/dustinfarris/ember-django-adapter/pull/95))
* [ENHANCEMENT] Support object-level errors
  ([#123](https://github.com/dustinfarris/ember-django-adapter/pull/123))
* [ENHANCEMENT] Support query parameter in buildURL
  ([#124](https://github.com/dustinfarris/ember-django-adapter/pull/124))
* [BUGFIX] Remove coalesceFindRequests warning
  ([#106](https://github.com/dustinfarris/ember-django-adapter/pull/106))
* [INTERNAL] Updated ember-cli version to latest (1.13.1)
  ([#112](https://github.com/dustinfarris/ember-django-adapter/pull/112))
* [INTERNAL] Test for setting an explicit id on createRecord
  ([#117](https://github.com/dustinfarris/ember-django-adapter/pull/117))
* [INTERNAL] Acceptance test for embedded records
  ([#119](https://github.com/dustinfarris/ember-django-adapter/pull/119))
* [INTERNAL] Test for embedded belongsTo create with id
  ([#120](https://github.com/dustinfarris/ember-django-adapter/pull/120))
* [DOCS] Using ember-cli-pagination with the adapter
  ([#101](https://github.com/dustinfarris/ember-django-adapter/pull/101))


0.5.6
-----

* [INTERNAL] Updated ember-cli version to latest (0.2.7)
  ([#99](https://github.com/dustinfarris/ember-django-adapter/pull/99))
* [INTERNAL] Updated ember-cli version to latest (0.2.6)
  ([#97](https://github.com/dustinfarris/ember-django-adapter/pull/97))
* [ENHANCEMENT] Support ember-data 1.0.0-beta.18
  ([#96](https://github.com/dustinfarris/ember-django-adapter/pull/96))
* [INTERNAL] Add tests for relationships support
  ([#94](https://github.com/dustinfarris/ember-django-adapter/pull/94))
* [INTERNAL] Updated ember-cli version to latest (0.2.5)
  ([#91](https://github.com/dustinfarris/ember-django-adapter/pull/91))


0.5.5
-----

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
