import {
  moduleFor,
  test
} from 'ember-qunit';

// The default (application) adapter is the DRF adapter.
// see app/adapters/application.js
moduleFor('adapter:application', 'DRFAdapter', { });

test('host config override', function() {
  var adapter = this.subject();
  equal(adapter.get('host'), 'test-host');
});

test('namespace config override', function() {
  var adapter = this.subject();
  equal(adapter.get('namespace'), 'test-api');
});

test('pathForType', function() {
  var adapter = this.subject();
  equal(adapter.pathForType('Animal'), 'animals');
});

test('buildURL', function() {
  var adapter = this.subject();
  equal(adapter.buildURL('Animal', 5, null), 'test-host/test-api/animals/5/');
});
