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

test('handleResponse - returns invalid error if 400 response', function(assert) {
  const headers = {},
        status = 400,
        payload = {
          name: ['This field cannot be blank.'],
          post_title: ['This field cannot be blank.', 'This field cannot be empty.']
        };

  var adapter = this.subject();
  var error = adapter.handleResponse(status, headers, payload);
  assert.equal(error.errors[0].detail, 'This field cannot be blank.');
  assert.equal(error.errors[0].source.pointer, '/data/attributes/name');
  assert.equal(error.errors[0].title, 'Invalid Attribute');

  assert.equal(error.errors[1].detail, 'This field cannot be blank.');
  assert.equal(error.errors[1].source.pointer, '/data/attributes/post_title');
  assert.equal(error.errors[1].title, 'Invalid Attribute');

  assert.equal(error.errors[2].detail, 'This field cannot be empty.');
  assert.equal(error.errors[2].source.pointer, '/data/attributes/post_title');
  assert.equal(error.errors[2].title, 'Invalid Attribute');
});

test('handleResponse - returns error if not 400 response', function(assert) {
  const headers = {},
        status = 403,
        payload = { detail: 'You do not have permission to perform this action.'},
        adapter = this.subject();
  var error = adapter.handleResponse(status, headers, payload);
  assert.equal(error.errors[0].detail, payload.detail);
});

test('handleResponse - returns error if payload is empty', function(assert) {
  const headers = {},
        status = 409,
        payload = {},
        adapter = this.subject();
  var error = adapter.handleResponse(status, headers, payload);
  assert.equal(error.errors[0].detail, '');
});

test('handleResponse - returns error with internal server error if 500', function(assert) {
  const headers = {},
        status = 500,
        payload = {},
        adapter = this.subject();
  var error = adapter.handleResponse(status, headers, payload);
  assert.equal(error.errors[0].detail, '');
  assert.equal(error.message, 'Internal Server Error');
});

test('_stripIDFromURL - returns base URL for type', function(assert) {
  var snapshot = {
    modelName: 'furry-animal'
  };
  var adapter = this.subject();

  assert.equal(adapter._stripIDFromURL('store', snapshot), 'test-host/test-api/furry-animals/');
});

test('_stripIDFromURL without trailing slash - returns base URL for type', function(assert) {
  var snapshot = {
    modelName: 'furry-animal'
  };
  var adapter = this.subject();
  adapter.set('addTrailingSlashes', false);

  assert.equal(adapter._stripIDFromURL('store', snapshot), 'test-host/test-api/furry-animals');
});
