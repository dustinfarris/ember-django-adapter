import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import Pretender from 'pretender';
import startApp from 'dummy/tests/helpers/start-app';

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
        if (request.queryParams.post_title === 'post title 2') {
          return [200, {'Content-Type': 'application/json'}, JSON.stringify([posts[1]])];
        } else {
          return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts)];
        }
      });

      // Retrieve single record
      this.get('/test-api/posts/1/', function() {
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
      this.delete('/test-api/posts/1/', function() {
        return [204];
      });
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('Retrieve list of non-paginated records', function(assert) {
  assert.expect(4);

  return store.findAll('post').then(function(posts) {

    assert.ok(posts);
    assert.equal(posts.get('length'), 3);

    var post = posts.objectAt(2);

    assert.equal(post.get('postTitle'), 'post title 3');
    assert.equal(post.get('body'), 'post body 3');
  });
});

test('Retrieve single record', function(assert) {
  assert.expect(3);

  return Ember.run(function() {

    return store.findRecord('post', 1).then(function(post) {

      assert.ok(post);
      assert.equal(post.get('postTitle'), 'post title 1');
      assert.equal(post.get('body'), 'post body 1');
    });
  });
});

test('Retrieve via query', function(assert) {
  assert.expect(3);

  return Ember.run(function() {

    return store.query('post', {post_title: 'post title 2'}).then(function(post) {

      assert.ok(post);

      post = post.objectAt(0);
      assert.equal(post.get('postTitle'), 'post title 2');
      assert.equal(post.get('body'), 'post body 2');
    });
  });
});

test('Create record', function(assert) {
  assert.expect(4);

  return Ember.run(function() {

    var post = store.createRecord('post', {
      postTitle: 'my new post title',
      body: 'my new post body'
    });

    return post.save().then(function(post) {

      assert.ok(post);
      assert.equal(post.get('id'), 4);
      assert.equal(post.get('postTitle'), 'my new post title');
      assert.equal(post.get('body'), 'my new post body');
    });
  });
});

test('Update record', function(assert) {
  assert.expect(7);

  return Ember.run(function() {

    return store.findRecord('post', 1).then(function(post) {

      assert.ok(post);
      assert.equal(post.get('isDirty'), false);

      return Ember.run(function() {

        post.set('postTitle', 'new post title');
        post.set('body', 'new post body');
        assert.equal(post.get('isDirty'), true);

        return post.save().then(function(post) {

          assert.ok(post);
          assert.equal(post.get('isDirty'), false);
          assert.equal(post.get('postTitle'), 'new post title');
          assert.equal(post.get('body'), 'new post body');
        });
      });
    });
  });
});

test('Delete record', function(assert) {
  assert.expect(2);

  return Ember.run(function() {

    return store.findRecord('post', 1).then(function(post) {

      assert.ok(post);

      return post.destroyRecord().then(function(post) {

        assert.ok(post);
      });
    });
  });
});
