import { run } from '@ember/runloop';
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
    comments: '/test-api/posts/1/comments/'
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: '/test-api/posts/2/comments/'
  }
];

var comments = [
  {
    id: 1,
    body: 'comment body 1',
    post: '/test-api/posts/1/'
  },
  {
    id: 2,
    body: 'comment body 1',
    post: '/test-api/posts/2/'
  },
  {
    id: 3,
    body: 'comment body 2',
    post: '/test-api/posts/1/'
  },
  {
    id: 4,
    body: 'comment body 3',
    post: '/test-api/posts/1/'
  }
];

module('Acceptance: Relationship Links', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('service:store');

    server = new Pretender(function() {
      this.get('/test-api/posts/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[request.params.id - 1])];
      });

      this.get('/test-api/posts/:id/comments/', function(request) {
        var related_post_url = '/test-api/posts/' + request.params.id + '/';
        var related_comments = comments.filter(function(comment) {
          return comment.post === related_post_url;
        });
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(related_comments)];
      });

      this.get('/test-api/comments/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(comments[request.params.id - 1])];
      });
    });
  },

  afterEach: function() {
    run(application, 'destroy');
    server.shutdown();
  }
});

test('belongsTo', function(assert) {
  assert.expect(2);

  return run(function() {

    return store.findRecord('comment', 2).then(function(comment) {

      assert.ok(comment);

      return comment.get('post').then(function(post) {
        assert.ok(post);
      });
    });
  });
});

test('hasMany', function(assert) {
  assert.expect(9);

  return run(function() {

    return store.findRecord('post', 1).then(function(post) {

      assert.ok(post);

      return post.get('comments').then(function(related_comments) {
        assert.ok(related_comments);
        assert.equal(related_comments.get('length'), 3);
        assert.ok(related_comments.objectAt(0));
        assert.equal(related_comments.objectAt(0).id, comments[0].id);
        assert.ok(related_comments.objectAt(1));
        assert.equal(related_comments.objectAt(1).id, comments[2].id);
        assert.ok(related_comments.objectAt(2));
        assert.equal(related_comments.objectAt(2).id, comments[3].id);
      });
    });
  });
});
