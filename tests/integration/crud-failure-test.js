import Ember from 'ember';
import { test } from 'ember-qunit';
import Pretender from 'pretender';
import startApp from '../helpers/start-app';

var App;
var store;
var server;


module('CRUD Failure', {
  setup: function() {
    App = startApp();

    store = App.__container__.lookup('store:main');

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

  teardown: function() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

/*
 * These integration tests need to use the QUnit.stop() / QUnit.start()
 * pattern as described in the following stackoverflow question:
 *
 * https://stackoverflow.com/questions/26317855/ember-cli-how-to-do-asynchronous-model-unit-testing-with-restadapter
 */
test('Permission denied error', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('post', 1).then({}, function(response) {
      ok(response);
      start();
      equal(response.status, 401);
      equal(response.statusText, 'Unauthorized');
      equal(response.responseText, JSON.stringify({detail: 'Authentication credentials were not provided.'}));
    });
  });
});

test('Server error', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('post', 2).then({}, function(response) {
      ok(response);
      start();
      equal(response.status, 500);
      equal(response.statusText, 'Internal Server Error');
      equal(response.responseText, '<h1>Server Error (500)</h1>');
    });
  });
});

test('Create field errors', function() {
  expect(6);

  var record,
    data = {postTitle: '', body: ''};

  stop();
  Ember.run(function() {
    record = store.createRecord('post', data);
    record.save().then({}, function(response) {
      ok(response);
      ok(response.errors);

      var errors = response.errors;

      // Test camelCase field.
      equal(errors.postTitle.length, 1);
      equal(errors.postTitle[0], 'This field is required.');

      // Test non-camelCase field.
      equal(errors.body.length, 1);
      equal(errors.body[0], 'This field is required.');

      start();
    });
  });
});

test('Update field errors', function() {
  expect(9);

  stop();
  Ember.run(function() {
    store.find('post', 3).then(function(response) {
      ok(response);

      equal(response.get('isDirty'), false);
      response.set('postTitle', 'Lorem ipsum dolor sit amet, consectetur adipiscing el');
      response.set('body', '');
      equal(response.get('isDirty'), true);

      response.save().then({}, function(updateResponse) {
        ok(updateResponse);
        ok(updateResponse.errors);

        var errors = updateResponse.errors;

        // Test camelCase field.
        equal(errors.postTitle.length, 1);
        equal(errors.postTitle[0], 'Ensure this value has at most 50 characters (it has 53).');

        // Test non-camelCase field.
        equal(errors.body.length, 1);
        equal(errors.body[0], 'This field is required.');

        start();
      });
    });
  });
});
