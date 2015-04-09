import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import Pretender from 'pretender';
import startApp from 'ember-django-adapter/tests/helpers/start-app';

var application;
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

module('Acceptance: CRUD Success', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('store:main');

    server = new Pretender(function() {

      // Retrieve list of non-paginated records
      this.get('/test-api/posts/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts)];
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

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

/*
 * These integration tests need to use the QUnit.stop() / QUnit.start()
 * pattern as described in the following stackoverflow question:
 *
 * https://stackoverflow.com/questions/26317855/ember-cli-how-to-do-asynchronous-model-unit-testing-with-restadapter
 */
test('Retrieve list of non-paginated records', function(assert) {
  assert.expect(4);

  stop();
  Ember.run(function() {
    store.find('post').then(function(response) {
      assert.ok(response);

      assert.equal(response.get('length'), 3);

      var post = response.objectAt(2);
      assert.equal(post.get('postTitle'), 'post title 3');
      assert.equal(post.get('body'), 'post body 3');

      start();
    });
  });
});

test('Retrieve single record', function(assert) {
  assert.expect(3);

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      assert.ok(response);

      assert.equal(response.get('postTitle'), 'post title 1');
      assert.equal(response.get('body'), 'post body 1');

      start();
    });
  });
});

test('Create record', function(assert) {
  assert.expect(4);

  var record,
    data = {postTitle: 'post title 4', body: 'post body 4'};

  stop();
  Ember.run(function() {
    record = store.createRecord('post', data);
    record.save().then(function(response) {
      assert.ok(response);

      assert.equal(response.get('id'), 4);
      assert.equal(response.get('title'), data['title']);
      assert.equal(response.get('body'), data['body']);

      start();
    });
  });
});

test('Update record', function(assert) {
  assert.expect(7);

  var postTitleUpdate = 'updated post title 1',
    bodyUpdate = 'updated post body 1';

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      assert.ok(response);

      assert.equal(response.get('isDirty'), false);
      response.set('postTitle', postTitleUpdate);
      response.set('body', bodyUpdate);
      assert.equal(response.get('isDirty'), true);

      response.save().then(function(updateResponse) {
        assert.ok(updateResponse);

        assert.equal(updateResponse.get('isDirty'), false);
        assert.equal(updateResponse.get('postTitle'), postTitleUpdate);
        assert.equal(updateResponse.get('body'), bodyUpdate);

        start();
      });
    });
  });
});

test('Delete record', function(assert) {
  assert.expect(2);

  stop();
  Ember.run(function() {
    store.find('post', 1).then(function(response) {
      assert.ok(response);

      response.destroyRecord().then(function(deleteResponse) {
        assert.ok(deleteResponse);

        start();
      });
    });
  });
});
