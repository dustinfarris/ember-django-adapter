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
    title: 'post title 1',
    body: 'post body 1',
    comments: []
  },
  {
    id: 2,
    title: 'post title 2',
    body: 'post body 2',
    comments: []
  },
  {
    id: 3,
    title: 'post title 3',
    body: 'post body 3',
    comments: []
  }
];

module('CRUD Integration', {
  setup: function() {
    App = startApp();

    store = App.__container__.lookup('store:main');

    server = new Pretender(function() {
      this.get('/test-api/posts/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts)];
      });
      this.post('/test-api/posts/', function(request) {
        var data = Ember.$.parseJSON(request.requestBody);
        data['id'] = 4;
        return [201, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });
      this.get('/test-api/paginated-posts/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify({results: posts})];
      });
      this.get('/test-api/posts/1/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[0])];
      });
      this.put('/test-api/posts/1/', function(request) {
        var data = Ember.merge(posts[0], Ember.$.parseJSON(request.requestBody));
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });
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

// Need to use the stop() / start() pattern for these integration tests to work. See this stackoverflow question for
// details:
// https://stackoverflow.com/questions/26317855/ember-cli-how-to-do-asynchronous-model-unit-testing-with-restadapter
//
test('Retrieving a list of records works', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('post').then(function(response) {
      ok(response);

      start();
      equal(response.get('length'), 3);

      var post = response.objectAt(2);
      equal(post.get('title'), 'post title 3');
      equal(post.get('body'), 'post body 3');
    });
  });
});

test('Retrieving a list of paginated records works', function() {
  expect(4);

  stop();
  Ember.run(function() {
    store.find('paginatedPost').then(function(response) {
      ok(response);

      start();
      equal(response.get('length'), 3);

      var post = response.objectAt(1);
      equal(post.get('title'), 'post title 2');
      equal(post.get('body'), 'post body 2');
    });
  });
});

test('Retrieving a single record works', function() {
  expect(3);

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      ok(response);

      start();
      equal(response.get('title'), 'post title 1');
      equal(response.get('body'), 'post body 1');
    });
  });
});

test('Creating a record works', function() {
  expect(4);

  var record,
    data = {title: 'post title 4', body: 'post body 4'};

  stop();
  Ember.run(function() {
    record = store.createRecord('post', data);
    record.save().then(function(response) {
      ok(response);

      start();
      equal(response.get('id'), 4);
      equal(response.get('title'), data['title']);
      equal(response.get('body'), data['body']);
    });
  });
});

test('Updating a record works', function() {
  expect(6);

  var body_update = 'updated post body 1';

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      ok(response);

      equal(response.get('isDirty'), false);
      response.set('body', body_update);
      equal(response.get('isDirty'), true);

      response.save().then(function(updateResponse) {
        ok(updateResponse);

        start();
        equal(updateResponse.get('isDirty'), false);
        equal(updateResponse.get('body', body_update), body_update);
        });
    });
  });
});

test('Deleting a record works', function() {
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
