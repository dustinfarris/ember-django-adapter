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
    comments: [1, 2, 3]
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: [4]
  }
];

var comments = [
  {
    id: 1,
    body: 'comment body 1',
    post: 1
  },
  {
    id: 2,
    body: 'comment body 2',
    post: 1
  },
  {
    id: 3,
    body: 'comment body 3',
    post: 1
  },
  {
    id: 4,
    body: 'comment body 4',
    post: 2
  }
];

module('Acceptance: Relationships', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('store:main');

    server = new Pretender(function() {

      this.get('/test-api/posts/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[request.params.id - 1])];
      });

      this.get('/test-api/comments/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(comments[request.params.id - 1])];
      });
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('belongsTo', function(assert) {
  assert.expect(2);

  return Ember.run(function() {

    return store.find('comment', 2).then(function(comment) {

      assert.ok(comment);

      return comment.get('post').then(function(post) {
        assert.ok(post);
      });
    });
  });
});


test('hasMany', function(assert) {
  assert.expect(6);

  return Ember.run(function() {

    return store.find('post', 1).then(function(post) {

      assert.ok(post);

      return post.get('comments').then(function(comments) {
        assert.ok(comments);
        assert.equal(comments.get('length'), 3);
        assert.ok(comments.objectAt(0));
        assert.ok(comments.objectAt(1));
        assert.ok(comments.objectAt(2));
      });
    });
  });
});
