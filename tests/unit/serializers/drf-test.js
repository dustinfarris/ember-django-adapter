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
