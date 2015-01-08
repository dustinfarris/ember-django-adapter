import {
  moduleFor,
  test
} from 'ember-qunit';

// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer', { });

test('extractSingle', function() {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted single');
  var type = { typeKey: 'person' };

  var result = serializer.extractSingle('store', type, 'payload', 'id');

  ok(serializer._super.calledWith(
    'store', type, { person: 'payload' }, 'id'
  ), '_super not called properly');
  equal(result, 'extracted single');
});

test('extractArray - results', function() {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = { typeKey: 'person' };
  var payload = { other: 'stuff', results: ['result'] };

  var result = serializer.extractArray('store', type, payload);

  ok(serializer._super.calledWith(
    'store', type, { person: ['result'] }
  ), '_super not called properly');
  equal(result, 'extracted array');
});

test('extractArray - no results', function() {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = { typeKey: 'person' };
  var payload = { other: 'stuff' };

  var result = serializer.extractArray('store', type, payload);

  ok(serializer._super.calledWith(
    'store', type, { person: { other: 'stuff' } }
  ), '_super not called properly');
  equal(result, 'extracted array');
});

test('serializeIntoHash', function() {
  var serializer = this.subject();
  serializer.serialize = sinon.stub().returns({ serialized: 'record' });
  var hash = { existing: 'hash' };

  serializer.serializeIntoHash(hash, 'type', 'record', 'options');

  ok(serializer.serialize.calledWith(
    'record', 'options'
  ), 'serialize not called properly');
  deepEqual(hash, { serialized: 'record', existing: 'hash' });
});

test('keyForAttribute', function() {
  var serializer = this.subject();

  var result = serializer.keyForAttribute('firstName');

  equal(result, 'first_name');
});

test('keyForRelationship', function() {
  var serializer = this.subject();

  var result = serializer.keyForRelationship('projectManagers', 'hasMany');

  equal(result, 'project_managers');
});

test('extractMeta', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 'count',
    next: '/api/posts/?page=3',
    previous: '/api/posts/?page=1'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 'count', next: 3, previous: 1}),
    'metaForType not called properly');
  ok(!payload.count, 'payload.count not removed');
  ok(!payload.next, 'payload.next not removed');
  ok(!payload.previous, 'payload.previous not removed');
});

test('extractPageNumber', function() {
  var serializer = this.subject();

  equal(serializer.extractPageNumber('http://xmpl.com/a/p/?page=3234'), 3234,
    'extractPageNumber failed on absolute URL');

  equal(serializer.extractPageNumber('/a/p/?page=3234'), 3234,
    'extractPageNumber failed on relative URL');

  equal(serializer.extractPageNumber(null), null,
    'extractPageNumber failed on null URL');

  equal(serializer.extractPageNumber('/a/p/'), null,
    'extractPageNumber failed on URL without query params');

  equal(serializer.extractPageNumber('/a/p/?ordering=-timestamp&user=123'), null,
    'extractPageNumber failed on URL with other query params');

  equal(serializer.extractPageNumber('/a/p/?fpage=23&pages=[1,2,3],page=123g&page=g123'), null,
    'extractPageNumber failed on URL with similar query params');
});
