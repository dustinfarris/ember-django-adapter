import {
  moduleFor,
  test
} from 'ember-qunit';

// The default (application) adapter is the DRF adapter.
// see app/adapters/application.js
moduleFor('adapter:application', 'DRFAdapter', {
  // The integration tests don't work with the host set so the host
  // setting is being overridden directly.
  subject: function(options, factory) {
    return factory.create({host: 'test-host'});
  }
});

test('host config override', function(assert) {
  var adapter = this.subject();
  assert.equal(adapter.get('host'), 'test-host');
});

test('namespace config override', function(assert) {
  var adapter = this.subject();
  assert.equal(adapter.get('namespace'), 'test-api');
});

test('pathForType', function(assert) {
  var adapter = this.subject();
  assert.equal(adapter.pathForType('Animal'), 'animals');
  assert.equal(adapter.pathForType('FurryAnimals'), 'furry-animals');
});

test('buildURL', function(assert) {
  var adapter = this.subject();
  assert.equal(adapter.buildURL('Animal', 5, null), 'test-host/test-api/animals/5/');
  assert.equal(adapter.buildURL('FurryAnimals', 5, null), 'test-host/test-api/furry-animals/5/');
});

test('buildURL - no trailing slashes', function(assert) {
  var adapter = this.subject();
  adapter.set('addTrailingSlashes', false);
  assert.equal(adapter.buildURL('Animal', 5, null), 'test-host/test-api/animals/5');
  assert.equal(adapter.buildURL('FurryAnimals', 5, null), 'test-host/test-api/furry-animals/5');
});

test('ajaxError - returns invalid error if 400 response', function(assert) {
  var error = new DS.InvalidError({errors: {name: ['This field cannot be blank.']}});

  var jqXHR = {
    status: 400,
    responseText: JSON.stringify({name: ['This field cannot be blank.']})
  };

  var adapter = this.subject();
  assert.equal(adapter.ajaxError(jqXHR), error.toString());
});

test('ajaxError - returns error if not 400 response', function(assert) {
  var jqXHR = {
    status: 403,
    responseText: JSON.stringify({detail: 'You do not have permission to perform this action.'})
  };

  var adapter = this.subject();
  assert.equal(adapter.ajaxError(jqXHR), jqXHR);
});

test('ajaxError - returns error if no responseText to parse', function(assert) {
  var jqXHR = {
    status: 500,
    statusText: 'Internal Server Error',
    responseText: ''
  };

  var adapter = this.subject();
  assert.equal(adapter.ajaxError(jqXHR), jqXHR);
});

test('ajaxError - returns ajax response if no status returned', function(assert) {
  var jqXHR = {
    responseText: 'Something went wrong'
  };

  var adapter = this.subject();
  assert.equal(adapter.ajaxError(jqXHR), jqXHR);
});

test('_stripIDFromURL - returns base URL for type', function(assert) {
  var snapshot = {
    typeKey: 'furry-animal'
  };
  var adapter = this.subject();

  assert.equal(adapter._stripIDFromURL('store', snapshot), 'test-host/test-api/furry-animals/');
});

test('_stripIDFromURL without trailing slash - returns base URL for type', function(assert) {
  var snapshot = {
    typeKey: 'furry-animal'
  };
  var adapter = this.subject();
  adapter.set('addTrailingSlashes', false);

  assert.equal(adapter._stripIDFromURL('store', snapshot), 'test-host/test-api/furry-animals');
});
