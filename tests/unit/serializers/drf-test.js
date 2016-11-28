import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer', {});

test('normalizeResponse - results (PageNumberPagination)', function(assert) {
  let serializer = this.subject();
  serializer._super = sinon.spy();
  let primaryModelClass = {modelName: 'person'};
  let payload = {
    count: 'count',
    next: '/api/posts/?page=3',
    previous: '/api/posts/?page=1',
    other: 'stuff',
    results: ['result']
  };

  serializer.normalizeResponse('store', primaryModelClass, payload, 1, 'requestType');
  assert.equal(serializer._super.callCount, 1);
  assert.equal(serializer._super.lastCall.args[0],'store');
  assert.propEqual(serializer._super.lastCall.args[1], primaryModelClass);
  assert.equal(serializer._super.lastCall.args[3], 1);
  assert.equal(serializer._super.lastCall.args[4], 'requestType');

  let modifiedPayload = serializer._super.lastCall.args[2];
  assert.equal('result', modifiedPayload[primaryModelClass.modelName][0]);

  assert.ok(modifiedPayload.meta);
  assert.equal(modifiedPayload.meta['next'], 3);
  assert.equal(modifiedPayload.meta['previous'], 1);
  // Unknown metadata has been passed along to the meta object.
  assert.equal(modifiedPayload.meta['other'], 'stuff');
});

test('normalizeResponse - results (CursorPagination)', function(assert) {
  let serializer = this.subject();
  serializer._super = sinon.spy();
  let primaryModelClass = {modelName: 'person'};
  let payload = {
    next: '/api/posts/?page=3',
    previous: '/api/posts/?page=1',
    other: 'stuff',
    results: ['result']
  };

  serializer.normalizeResponse('store', primaryModelClass, payload, 1, 'requestType');
  assert.equal(serializer._super.callCount, 1);
  assert.equal(serializer._super.lastCall.args[0],'store');
  assert.propEqual(serializer._super.lastCall.args[1], primaryModelClass);
  assert.equal(serializer._super.lastCall.args[3], 1);
  assert.equal(serializer._super.lastCall.args[4], 'requestType');

  let modifiedPayload = serializer._super.lastCall.args[2];
  assert.equal('result', modifiedPayload[primaryModelClass.modelName][0]);

  assert.ok(modifiedPayload.meta);
  assert.equal(modifiedPayload.meta['next'], 3);
  assert.equal(modifiedPayload.meta['previous'], 1);
  // Unknown metadata has been passed along to the meta object.
  assert.equal(modifiedPayload.meta['other'], 'stuff');
});

test('normalizeResponse - results (non-pagination metadata)', function(assert) {
  let serializer = this.subject();
  serializer._super = sinon.spy();
  let primaryModelClass = {modelName: 'person'};
  let payload = {
    other: 'stuff',
    results: ['result']
  };

  serializer.normalizeResponse('store', primaryModelClass, payload, 1, 'requestType');
  assert.equal(serializer._super.callCount, 1);
  assert.equal(serializer._super.lastCall.args[0],'store');
  assert.propEqual(serializer._super.lastCall.args[1], primaryModelClass);
  assert.equal(serializer._super.lastCall.args[3], 1);
  assert.equal(serializer._super.lastCall.args[4], 'requestType');

  let modifiedPayload = serializer._super.lastCall.args[2];
  assert.equal('result', modifiedPayload[primaryModelClass.modelName][0]);

  assert.ok(modifiedPayload.meta);
  // Unknown metadata has been passed along to the meta object.
  assert.equal(modifiedPayload.meta['other'], 'stuff');
});

test('normalizeResponse - no results', function(assert) {
  let serializer = this.subject();
  serializer._super = sinon.stub().returns('extracted array');
  let primaryModelClass = {modelName: 'person'};
  let payload = {other: 'stuff'};

  let result = serializer.normalizeResponse('store', primaryModelClass, payload, 1, 'requestType');
  assert.equal(result, 'extracted array');

  let convertedPayload = {};
  convertedPayload[primaryModelClass.modelName] = payload;
  assert.ok(serializer._super.calledWith('store', primaryModelClass, convertedPayload, 1, 'requestType'),
    '_super not called properly');
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

test('extractRelationships', function(assert) {
  assert.expect(47);

  // Generates a payload hash for the specified urls array. This is used to generate
  // new payloads to test with different the relationships types.
  function ResourceHash(urls) {
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
  function TypeClass(relationship, resourceHash) {
    this.eachRelationship = function(callback, binding) {
      for (var key in resourceHash) {
        if (resourceHash.hasOwnProperty(key) && key !== 'links' && key !== 'id') {
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
  // Add a spy to _super because we only want to test our code.
  serializer._super = sinon.spy();

  // Test with hasMany and belongsTo relationships.
  var validRelationships = ['hasMany', 'belongsTo'];
  validRelationships.forEach(function(relationship) {
    var resourceHash = new ResourceHash(testURLs);
    serializer.extractRelationships(new TypeClass(relationship, resourceHash), resourceHash);

    assert.equal(Object.keys(resourceHash).length, 9, Ember.String.fmt(wrongSizePayloadMessage, [relationship]));

    // 'j' & 'k' need to be handled separately because they are false values.
    var expectedPayloadKeys = ['id', 'links', 'e', 'f', 'g', 'h', 'i'];
    expectedPayloadKeys.forEach(function(key) {
      assert.ok(resourceHash[key], Ember.String.fmt(missingKeyMessage, [relationship, key]));
    });
    assert.equal(resourceHash['j'], '', Ember.String.fmt(missingKeyMessage, [relationship, 'j']));
    assert.equal(resourceHash['k'], null, Ember.String.fmt(missingKeyMessage, [relationship], 'k'));

    assert.equal(Object.keys(resourceHash.links).length, 4, Ember.String.fmt(wrongSizeLinksMessage, [relationship]));

    var i = 0;
    var expectedLinksKeys = ['a', 'b', 'c', 'd'];
    expectedLinksKeys.forEach(function(key) {
      assert.equal(resourceHash.links[key], testURLs[i],
        Ember.String.fmt('Links value of property %@ in the %@ relationship is not correct.', [key, relationship]));
      i++;
    });
  });

  assert.equal(serializer._super.callCount, 2, '_super() was not called once for each relationship.');

  // Test with an unknown relationship.
  var relationship = 'xxUnknownXX';
  var payload = new ResourceHash(testURLs);
  serializer.extractRelationships(new TypeClass(relationship, payload), payload);

  assert.equal(Object.keys(payload).length, 13, Ember.String.fmt(wrongSizePayloadMessage, [relationship]));

  // 'j' & 'k' need to be handled separately because they are false values.
  var expectedPayloadKeys = ['id', 'links', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  expectedPayloadKeys.forEach(function(key) {
    assert.ok(payload[key], Ember.String.fmt(missingKeyMessage, [relationship, key]));
  });
  assert.equal(payload['j'], '', Ember.String.fmt(missingKeyMessage, [relationship, 'j']));
  assert.equal(payload['k'], null, Ember.String.fmt(missingKeyMessage, [relationship], 'k'));

  assert.equal(Object.keys(payload.links).length, 0, Ember.String.fmt(wrongSizeLinksMessage, [relationship]));

  assert.equal(serializer._super.callCount, 3, Ember.String.fmt('_super() was not called for the %@ relationship.', [relationship]));
});
