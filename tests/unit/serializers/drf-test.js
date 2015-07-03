import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer', {});

test('extractSingle', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted single');
  var type = {modelName: 'person'};

  var result = serializer.extractSingle('store', type, 'payload', 'id');

  assert.ok(serializer._super.calledWith(
    'store', type, {person: 'payload'}, 'id'
  ), '_super not called properly');
  assert.equal(result, 'extracted single');
});

test('extractArray - results', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = {modelName: 'person'};
  var payload = {other: 'stuff', results: ['result']};

  var result = serializer.extractArray('store', type, payload);

  assert.ok(serializer._super.calledWith(
    'store', type, {person: ['result']}
  ), '_super not called properly');
  assert.equal(result, 'extracted array');
});

test('extractArray - no results', function(assert) {
  var serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  var type = {modelName: 'person'};
  var payload = {other: 'stuff'};

  var result = serializer.extractArray('store', type, payload);

  assert.ok(serializer._super.calledWith(
    'store', type, {person: {other: 'stuff'}}
  ), '_super not called properly');
  assert.equal(result, 'extracted array');
});

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

test('extractMeta', function(assert) {
  var serializer = this.subject();
  var store = {setMetadataFor: sinon.spy()};
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

test('normalize', function(assert) {
  var serializer = this.subject();
  serializer.addRelationshipsToLinks = sinon.spy();
  var typeClass = {
    eachAttribute: sinon.stub(),
    eachRelationship: sinon.stub(),
    eachTransformedAttribute: sinon.stub()
  };
  var payload = {dummy: 'data'};

  serializer.normalize(typeClass, payload, 'animal');

  assert.ok(serializer.addRelationshipsToLinks.calledWith(typeClass, payload),
    'addRelationshipsToLinks not called properly');
});

test('addRelationshipsToLinks', function(assert) {
  assert.expect(45);

  // Generates a payload hash for the specified urls array. This is used to generate
  // new payloads to test with different the relationships types.
  function Payload(urls) {
    this.id = 1;
    var letter = 'a';
    var self = this;
    urls.forEach(function(url) {
      self[letter] = url;
      letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    });
  }

  // Generates a typeClass object for the specified relationship and payload. This is used to generate
  // new stubbed out typeClasses to test with different the relationships types and payload.
  function TypeClass(relationship, payload) {
    this.eachRelationship = function(callback, binding) {
      for (var key in payload) {
        if (payload.hasOwnProperty(key) && key !== 'links' && key !== 'id') {
          callback.call(binding, key, {kind: relationship});
        }
      }
    };
  }

  // More URLs can be tested by adding them to the correct section and adjusting
  // the expectedPayloadKeys and the expectedLinksKeys variables.
  var testURLs = [
    // Valid relationship URLs.
    '/api/users/1',
    'https://example.com/api/users/1',
    'http://example.com/api/users/1',
    '//example.com/api/users/1',

    // Invalid relationship URLs
    'api',
    'ftp://example.com//api/users/1',
    'http//example.com/api/users/1',
    'https//example.com/api/users/1',
    '///example.com/api/users/1',
    '',
    null
  ];

  // Error messages.
  var missingKeyMessage = 'Modified payload for the %@ relationship is missing the %@ property.';
  var wrongSizePayloadMessage = 'Modified payload for the %@ relationship is not the correct size.';
  var wrongSizeLinksMessage = 'The links hash for the %@ relationship is not the correct size.';

  var serializer = this.subject();

  // Test with hasMany and belongsTo relationships.
  var validRelationships = ['hasMany', 'belongsTo'];
  validRelationships.forEach(function(relationship) {
    var payload = new Payload(testURLs);
    serializer.addRelationshipsToLinks(new TypeClass(relationship, payload), payload);

    assert.equal(Object.keys(payload).length, 9, Ember.String.fmt(wrongSizePayloadMessage, [relationship]));

    // 'j' & 'k' need to be handled separately because they are false values.
    var expectedPayloadKeys = ['id', 'links', 'e', 'f', 'g', 'h', 'i'];
    expectedPayloadKeys.forEach(function(key) {
      assert.ok(payload[key], Ember.String.fmt(missingKeyMessage, [relationship, key]));
    });
    assert.equal(payload['j'], '', Ember.String.fmt(missingKeyMessage, [relationship, 'j']));
    assert.equal(payload['k'], null, Ember.String.fmt(missingKeyMessage, [relationship], 'k'));

    assert.equal(Object.keys(payload.links).length, 4, Ember.String.fmt(wrongSizeLinksMessage, [relationship]));

    var i = 0;
    var expectedLinksKeys = ['a', 'b', 'c', 'd'];
    expectedLinksKeys.forEach(function(key) {
      assert.equal(payload.links[key], testURLs[i],
        Ember.String.fmt('Links value of property %@ in the %@ relationship is not correct.', [key, relationship]));
      i++;
    });
  });

  // Test with an unknown relationship.
  var relationship = 'xxUnknownXX';
  var payload = new Payload(testURLs);
  serializer.addRelationshipsToLinks(new TypeClass(relationship, payload), payload);

  assert.equal(Object.keys(payload).length, 13, Ember.String.fmt(wrongSizePayloadMessage, [relationship]));

  // 'j' & 'k' need to be handled separately because they are false values.
  var expectedPayloadKeys = ['id', 'links', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  expectedPayloadKeys.forEach(function(key) {
    assert.ok(payload[key], Ember.String.fmt(missingKeyMessage, [relationship, key]));
  });
  assert.equal(payload['j'], '', Ember.String.fmt(missingKeyMessage, [relationship, 'j']));
  assert.equal(payload['k'], null, Ember.String.fmt(missingKeyMessage, [relationship], 'k'));

  assert.equal(Object.keys(payload.links).length, 0, Ember.String.fmt(wrongSizeLinksMessage, [relationship]));
});
