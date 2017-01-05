import { moduleFor, test } from 'ember-qunit';


// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer');

test('serializeIntoHash', function(assert) {
  var serializer = this.subject();
  serializer.serialize = sinon.stub().returns({serialized: 'record'});
  var hash = {existing: 'hash'};

  serializer.serializeIntoHash(hash, 'type', 'record', 'options');

  assert.ok(serializer.serialize.calledWith(
    'record', 'options'
  ), 'serialize not called properly');
  assert.deepEqual(hash, {serialized: 'record', existing: 'hash'});
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
