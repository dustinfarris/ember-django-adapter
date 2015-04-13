import {
  moduleFor,
  test
} from 'ember-qunit';

// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer', { });

test('extractSingle', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted single');
  var type = { typeKey: 'person' };

  var result = serializer.extractSingle('store', type, 'payload', 'id');

  assert.ok(serializer._super.calledWith(
    'store', type, { person: 'payload' }, 'id'
  ), '_super not called properly');
  assert.equal(result, 'extracted single');
});

test('extractArray - results', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = { typeKey: 'person' };
  var payload = { other: 'stuff', results: ['result'] };

  var result = serializer.extractArray('store', type, payload);

  assert.ok(serializer._super.calledWith(
    'store', type, { person: ['result'] }
  ), '_super not called properly');
  assert.equal(result, 'extracted array');
});

test('extractArray - no results', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = { typeKey: 'person' };
  var payload = { other: 'stuff' };

  var result = serializer.extractArray('store', type, payload);

  assert.ok(serializer._super.calledWith(
    'store', type, { person: { other: 'stuff' } }
  ), '_super not called properly');
  assert.equal(result, 'extracted array');
});

test('serializeIntoHash', function(assert) {
  var serializer = this.subject();
  serializer.serialize = sinon.stub().returns({ serialized: 'record' });
  var hash = { existing: 'hash' };

  serializer.serializeIntoHash(hash, 'type', 'record', 'options');

  assert.ok(serializer.serialize.calledWith(
    'record', 'options'
  ), 'serialize not called properly');
  assert.deepEqual(hash, { serialized: 'record', existing: 'hash' });
});

test('keyForAttribute', function(assert) {
  var serializer = this.subject();

  var result = serializer.keyForAttribute('firstName');

  assert.equal(result, 'first_name');
});

test('keyForRelationship', function(assert) {
  var serializer = this.subject();

  var result = serializer.keyForRelationship('projectManagers', 'hasMany');

  assert.equal(result, 'project_managers');
});

test('extractMeta', function(assert) {
  var serializer = this.subject();
  var store = { setMetadataFor: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 'count',
    next: '/api/posts/?page=3',
    previous: '/api/posts/?page=1'
  };

  serializer.extractMeta(store, 'type', payload);

  assert.ok(store.setMetadataFor.calledWith('type', {count: 'count', next: 3, previous: 1}),
    'metaForType not called properly');
  assert.ok(!payload.count, 'payload.count not removed');
  assert.ok(!payload.next, 'payload.next not removed');
  assert.ok(!payload.previous, 'payload.previous not removed');
});

test('extractPageNumber', function(assert) {
  var serializer = this.subject();

  assert.equal(serializer.extractPageNumber('http://xmpl.com/a/p/?page=3234'), 3234,
    'extractPageNumber failed on absolute URL');

  assert.equal(serializer.extractPageNumber('/a/p/?page=3234'), 3234,
    'extractPageNumber failed on relative URL');

  assert.equal(serializer.extractPageNumber(null), null,
    'extractPageNumber failed on null URL');

  assert.equal(serializer.extractPageNumber('/a/p/'), null,
    'extractPageNumber failed on URL without query params');

  assert.equal(serializer.extractPageNumber('/a/p/?ordering=-timestamp&user=123'), null,
    'extractPageNumber failed on URL with other query params');

  assert.equal(serializer.extractPageNumber('/a/p/?fpage=23&pages=[1,2,3],page=123g&page=g123'), null,
    'extractPageNumber failed on URL with similar query params');
});
