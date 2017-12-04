import { run } from '@ember/runloop';
import $ from 'jquery';
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
        id: 2,
        body: 'comment body 2'
      },
      {
        id: 3,
        body: 'comment body 3'
      },
      {
        id: 4,
        body: 'comment body 4'
      }
    ]
  }
];

var embeddedPostComments = [
  {
    id: 5,
    body: 'comment body 5',
    post: {
      id: 6,
      post_title: 'post title 6',
      body: 'post body 6'
    }
  }
];

var posts = [
  {
    id: 7,
    post_title: 'post title 7',
    body: 'post body 7',
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

      this.get('/test-api/embedded-post-comments/5/', function() {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(embeddedPostComments[0])];
      });

      this.get('/test-api/posts/7/', function() {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(posts[0])];
      });

      this.post('/test-api/embedded-post-comments/', function(request) {
        let data = $.parseJSON(request.requestBody);
        data['id'] = 8;
        data['post'] = posts[0];
        return [201, {'Content-Type': 'application/json'}, JSON.stringify(data)];
      });

    });
  },

  afterEach: function() {
    run(application, 'destroy');
    server.shutdown();
  }
});

test('belongsTo retrieve', function(assert) {
  assert.expect(6);

  return run(function() {

    return store.findRecord('embedded-post-comment', 5).then(function(comment) {
      assert.ok(comment);
      assert.equal(comment.get('body'), 'comment body 5');

      let post = comment.get('post');
      assert.ok(post);
      assert.equal(post.get('postTitle'), 'post title 6');
      assert.equal(post.get('body'), 'post body 6');

      assert.equal(server.handledRequests.length, 1);
    });
  });
});

test('hasMany retrieve', function(assert) {
  assert.expect(12);

  return run(function() {

    return store.findRecord('embedded-comments-post', 1).then(function(post) {
      assert.ok(post);
      assert.equal(post.get('postTitle'), 'post title 1');
      assert.equal(post.get('body'), 'post body 1');

      let comments = post.get('comments');
      assert.ok(comments);
      assert.equal(comments.get('length'), 3);
      assert.ok(comments.objectAt(0));
      assert.equal(comments.objectAt(0).get('body'), 'comment body 2');
      assert.ok(comments.objectAt(1));
      assert.equal(comments.objectAt(1).get('body'), 'comment body 3');
      assert.ok(comments.objectAt(2));
      assert.equal(comments.objectAt(2).get('body'), 'comment body 4');

      assert.equal(server.handledRequests.length, 1);
    });
  });
});

test('belongsTo create', function(assert) {
  assert.expect(6);

  return run(function() {

    return store.findRecord('post', 7).then(function(post) {

      let comment = store.createRecord('embedded-post-comment', {
        body: 'comment body 9',
        post: post
      });

      return comment.save().then(function(comment) {

        assert.ok(comment);
        assert.ok(comment.get('id'));
        assert.equal(comment.get('body'), 'comment body 9');
        assert.ok(comment.get('post'));

        assert.equal(server.handledRequests.length, 2);
        let requestBody = (JSON.parse(server.handledRequests.pop().requestBody));
        assert.equal(requestBody.post, 7);
      });
    });
  });
});
