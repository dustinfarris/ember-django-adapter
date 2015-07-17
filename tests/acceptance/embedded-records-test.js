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

var embeddedCommentsPosts = [
  {
    id: 1,
    post_title: 'post title 1',
    body: 'post body 1',
    comments: [
      {
        id: 1,
        body: 'comment body 1'
      },
      {
        id: 2,
        body: 'comment body 2'
      },
      {
        id: 3,
        body: 'comment body 3'
      }
    ]
  }
];

var embeddedPostComments = [
  {
    id: 1,
    body: 'comment body 1',
    post: {
      id: 1,
      post_title: 'post title 1',
      body: 'post body 1'
    }
  }
];

module('Acceptance: Embedded Records', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('service:store');

    server = new Pretender(function() {

      this.get('/test-api/embedded-comments-posts/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(embeddedCommentsPosts[request.params.id - 1])];
      });

      this.get('/test-api/embedded-post-comments/:id/', function(request) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(embeddedPostComments[request.params.id - 1])];
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

    return store.findRecord('embedded-post-comment', 1).then(function(comment) {

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

    return store.findRecord('embedded-comments-post', 1).then(function(post) {

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
