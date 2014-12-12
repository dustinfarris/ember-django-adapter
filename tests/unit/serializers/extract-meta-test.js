import { moduleFor, test } from 'ember-qunit';

// The default (application) serializer is the DRF adapter.
// see app/serializers/application.js
moduleFor('serializer:application', 'DRFSerializer.extractMeta', { });

test('metadata removed from payload', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 'count',
    next: 'next',
    previous: 'previous'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(!payload.count, 'payload.count not removed');
  ok(!payload.next, 'payload.next not removed');
  ok(!payload.previous, 'payload.previous not removed');
});

test('next and previous absolute URIs parsed correctly', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: 'http://example.com/test-api/posts/?page=3',
    previous: 'http://example.com/test-api/posts/?page=1'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000, next: 3, previous: 1}),
    'metaForType not called properly');
});


test('next and previous relative URIs parsed correctly', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };

  var payload = {
    results: 'mock',
    count: 1000,
    next: '/test-api/posts/?page=300',
    previous: '/test-api/posts/?page=298'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type',
    {count: 1000, next: 300, previous: 298}),
    'metaForType not called properly');
});

test('null next URI excludes next from metadata', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: null,
    previous: '/test-api/posts/?page=300'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000, previous: 300}),
    'metaForType not called properly when next is null');

});

test('null previous URI excludes previous from metadata', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: '/test-api/posts/?page=2',
    previous: null
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000, next: 2}),
    'metaForType not called properly when previous is null');
});

test('null next and previous URIs excludes both from metadata', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: null,
    previous: null
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000}),
    'metaForType not called properly when next and previous are null');
});


test('no page query param in next and previous URIs excludes both from metadata', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: '/test-api/posts/?ordering=-timestamp&user=123&gpage=46',
    previous: '/test-api/posts/?ordering=-timestamp&user=123&fpage=23&pages=[1,2,3]'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000}),
    'metaForType not called properly');
});

test('no query params in next and previous URIs excludes both from metadata', function() {
  var serializer = this.subject();
  var store = { metaForType: sinon.spy() };
  var payload = {
    results: 'mock',
    count: 1000,
    next: '/test-api/posts/',
    previous: '/test-api/posts/'
  };

  serializer.extractMeta(store, 'type', payload);

  ok(store.metaForType.calledWith('type', {count: 1000}),
    'metaForType not called properly with no query params');
});
