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

var posts = [
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: []
  }
];

module('Acceptance: Embedded Records', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('service:store');

    server = new Pretender(function() {

      this.get('/test-api/embedded-comments-posts/1/', function( ) {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(embeddedCommentsPosts[0])];
      });

      this.get('/test-api/embedded-post-comments/1/', function() {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(embeddedPostComments[0])];
      });

      this.get('/test-api/posts/2/', function() {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[0])];
      });

      this.post('/test-api/embedded-post-comments/', function(request) {
        let data = Ember.$.parseJSON(request.requestBody);
        data['id'] = 2;
        data['post'] = posts[0];
        return [201, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });

    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('belongsTo retrieve', function(assert) {
  assert.expect(2);

  return Ember.run(function() {

    return store.findRecord('embedded-post-comment', 1).then(function(comment) {

      assert.ok(comment);
      assert.ok(comment.get('post'));
    });
  });
});

test('hasMany retrieve', function(assert) {
  assert.expect(6);

  return Ember.run(function() {

    return store.findRecord('embedded-comments-post', 1).then(function(post) {

      assert.ok(post);

      let comments = post.get('comments');
      assert.ok(comments);
      assert.equal(comments.get('length'), 3);
      assert.ok(comments.objectAt(0));
      assert.ok(comments.objectAt(1));
      assert.ok(comments.objectAt(2));
    });
  });
});

test('belongsTo create', function(assert) {
  assert.expect(5);

  return Ember.run(function() {

    return store.findRecord('post', 2).then(function(post) {

      let comment = store.createRecord('embedded-post-comment', {
        body: 'comment body 2',
        post: post
      });

      return comment.save().then(function(comment) {

        assert.ok(comment);
        assert.ok(comment.get('id'));
        assert.equal(comment.get('body'), 'comment body 2');
        assert.ok(comment.get('post'));

        let requestBody = (JSON.parse(server.handledRequests.pop().requestBody));
        assert.equal(requestBody.post, 2);

      });
    });
  });
});
