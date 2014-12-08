import Ember from 'ember';
import { test } from 'ember-qunit';
import Pretender from 'pretender';
import startApp from '../helpers/start-app';

var App;
var store;
var server;

var posts = [
  {
    id: 1,
    post_title: 'post title 1',
    body: 'post body 1',
    comments: []
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: []
  },
  {
    id: 3,
    post_title: 'post title 3',
    body: 'post body 3',
    comments: []
  }
];

module('CRUD Success', {
  setup: function() {
    App = startApp();

    store = App.__container__.lookup('store:main');

    server = new Pretender(function() {

      // Retrieve list of non-paginated records
      this.get('/test-api/posts/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts)];
      });

      // Retrieve list of paginated records
      this.get('/test-api/paginated-posts/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify({results: posts})];
      });

      // Retrieve single record
      this.get('/test-api/posts/1/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[0])];
      });

      // Create record
      this.post('/test-api/posts/', function(request) {
        var data = Ember.$.parseJSON(request.requestBody);
        data['id'] = 4;
        return [201, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });

      // Update record
      this.put('/test-api/posts/1/', function(request) {
        var data = Ember.merge(posts[0], Ember.$.parseJSON(request.requestBody));
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });

      // Delete record
      this.delete('/test-api/posts/1/', function(request) {
        return [204];
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
test('Retrieve list of non-paginated records', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('post').then(function(response) {
      ok(response);

      equal(response.get('length'), 3);

      var post = response.objectAt(2);
      equal(post.get('postTitle'), 'post title 3');
      equal(post.get('body'), 'post body 3');

      start();
    });
  });
});

test('Retrieve list of paginated records', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('paginatedPost').then(function(response) {
      ok(response);

      equal(response.get('length'), 3);

      var post = response.objectAt(1);
      equal(post.get('postTitle'), 'post title 2');
      equal(post.get('body'), 'post body 2');

      start();
    });
  });
});

test('Retrieve single record', function() {
  expect(3);

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      ok(response);

      equal(response.get('postTitle'), 'post title 1');
      equal(response.get('body'), 'post body 1');

      start();
    });
  });
});

test('Create record', function() {
  expect(4);

  var record,
    data = {postTitle: 'post title 4', body: 'post body 4'};

  stop();
  Ember.run(function() {
    record = store.createRecord('post', data);
    record.save().then(function(response) {
      ok(response);

      equal(response.get('id'), 4);
      equal(response.get('title'), data['title']);
      equal(response.get('body'), data['body']);

      start();
    });
  });
});

test('Update record', function() {
  expect(7);

  var postTitleUpdate = 'updated post title 1',
    bodyUpdate = 'updated post body 1';

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      ok(response);

      equal(response.get('isDirty'), false);
      response.set('postTitle', postTitleUpdate);
      response.set('body', bodyUpdate);
      equal(response.get('isDirty'), true);

      response.save().then(function(updateResponse) {
        ok(updateResponse);

        equal(updateResponse.get('isDirty'), false);
        equal(updateResponse.get('postTitle'), postTitleUpdate);
        equal(updateResponse.get('body'), bodyUpdate);

        start();
      });
    });
  });
});

test('Delete record', function() {
  expect(2);

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      ok(response);

      response.destroyRecord().then(function(deleteResponse) {
        ok(deleteResponse);

        start();
      });
    });
  });
});
