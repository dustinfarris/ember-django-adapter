import Ember from 'ember';
import {
  module,
  test,
} from 'qunit';
import Pretender from 'pretender';
import startApp from 'dummy/tests/helpers/start-app';

var application;
var store;
var server;


module('Acceptance: CRUD Failure', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('store:main');

    server = new Pretender(function() {

      // Permission denied error
      this.get('/test-api/posts/1/', function(request) {
        return [401, {'Content-Type': 'application/json'}, JSON.stringify({detail: 'Authentication credentials were not provided.'})];
      });

      // Server error
      this.get('/test-api/posts/2/', function(request) {
        // This is the default error page for Django when DEBUG is set to False.
        return [500, {'Content-Type': 'text/html'}, '<h1>Server Error (500)</h1>'];
      });

      // Create field errors
      this.post('/test-api/posts/', function(request) {
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({
          post_title: ['This field is required.'],
          body: ['This field is required.']
        })];
      });

      // Update field errors
      this.get('/test-api/posts/3/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify({
          id: 3,
          post_title: 'post title 3',
          body: 'post body 3',
          comments: []
        })];
      });
      this.put('/test-api/posts/3/', function(request) {
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({
          post_title: ['Ensure this value has at most 50 characters (it has 53).'],
          body: ['This field is required.']
        })];
      });
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('Permission denied error', function(assert) {
  assert.expect(4);

  return Ember.run(function() {

    return store.find('post', 1).then({}, function(response) {

      assert.ok(response);
      assert.equal(response.status, 401);
      assert.equal(response.statusText, 'Unauthorized');
      assert.equal(response.responseText, JSON.stringify({detail: 'Authentication credentials were not provided.'}));
    });
  });
});

test('Server error', function(assert) {
  assert.expect(4);

  return Ember.run(function() {

    return store.find('post', 2).then({}, function(response) {

      assert.ok(response);
      assert.equal(response.status, 500);
      assert.equal(response.statusText, 'Internal Server Error');
      assert.equal(response.responseText, '<h1>Server Error (500)</h1>');
    });
  });
});

test('Create field errors', function(assert) {
  assert.expect(6);

  return Ember.run(function() {

    var post = store.createRecord('post', {
      postTitle: '',
      body: ''
    });

    return post.save().then({}, function(response) {

      assert.ok(response);
      assert.ok(response.errors);

      // Test camelCase field.
      assert.equal(response.errors.postTitle.length, 1);
      assert.equal(response.errors.postTitle[0], 'This field is required.');

      // Test non-camelCase field.
      assert.equal(response.errors.body.length, 1);
      assert.equal(response.errors.body[0], 'This field is required.');
    });
  });
});

test('Update field errors', function(assert) {
  assert.expect(9);

  return Ember.run(function() {

    return store.find('post', 3).then(function(post) {

      assert.ok(post);
      assert.equal(post.get('isDirty'), false);
      post.set('postTitle', 'Lorem ipsum dolor sit amet, consectetur adipiscing el');
      post.set('body', '');
      assert.equal(post.get('isDirty'), true);

      post.save().then({}, function(response) {

        assert.ok(response);
        assert.ok(response.errors);

        // Test camelCase field.
        assert.equal(response.errors.postTitle.length, 1);
        assert.equal(response.errors.postTitle[0], 'Ensure this value has at most 50 characters (it has 53).');

        // Test non-camelCase field.
        assert.equal(response.errors.body.length, 1);
        assert.equal(response.errors.body[0], 'This field is required.');
      });
    });
  });
});
