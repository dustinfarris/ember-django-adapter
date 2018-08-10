import { run } from '@ember/runloop';
import {
  module,
  test,
} from 'qunit';
import Pretender from 'pretender';
import startApp from 'dummy/tests/helpers/start-app';

var application;
var store;
var server;


module('Acceptance: CRUD Failure', {
  beforeEach: function() {
    application = startApp();

    store = application.__container__.lookup('service:store');

    server = new Pretender(function() {

      // Permission denied error
      this.get('/test-api/posts/1/', function() {
        return [401, {'Content-Type': 'application/json'}, JSON.stringify({detail: 'Authentication credentials were not provided.'})];
      });

      // Server error
      this.get('/test-api/posts/2/', function() {
        // This is the default error page for Django when DEBUG is set to False.
        return [500, {'Content-Type': 'application/json'}, JSON.stringify({detail: 'Something bad'})];
      });

      // Authentication Invalid error
      this.post('/test-api/posts/3', function() {
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({name: 'error 1', non_field_errors: 'error 2'})];
      });


      // Create field errors
      this.post('/test-api/posts/', function(request) {
        var data = JSON.parse(request.requestBody);
        if (data.body === 'non_field_errors') {
          return [400, {'Content-Type': 'application/json'}, JSON.stringify({
            body: ['error 1'],
            non_field_errors: ['error 2', 'error 3']
          })];
        }
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({
          post_title: ['This field is required.'],
          body: ['This field is required.', 'This field cannot be blank.']
        })];
      });

      // Create nested field errors
      this.post('/test-api/embedded-post-comments/', function() {
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({
          post: {
            post_title: ['This field is required.'],
            body: ['This field is required.', 'This field cannot be blank.'],
            non_field_errors: ['error 2', 'error 3']
          }
        })];
      });

      // Update field errors
      this.get('/test-api/posts/3/', function() {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify({
          id: 3,
          post_title: 'post title 3',
          body: 'post body 3',
          comments: []
        })];
      });
      this.put('/test-api/posts/3/', function() {
        return [400, {'Content-Type': 'application/json'}, JSON.stringify({
          post_title: ['Ensure this value has at most 50 characters (it has 53).'],
          body: ['This field is required.']
        })];
      });
    });
  },

  afterEach: function() {
    run(application, 'destroy');
    server.shutdown();
  }
});

test('Permission denied error', function(assert) {
  assert.expect(4);

  return run(function() {

    return store.findRecord('post', 1).then({}, function(response) {
      const error = response.errors[0];

      assert.ok(error);
      assert.equal(error.status, 401);
      assert.equal(error.detail, 'Authentication credentials were not provided.');
      assert.equal(response.message, 'Unauthorized');
    });
  });
});

test('Server error', function(assert) {
  assert.expect(4);

  return run(function() {

    return store.findRecord('post', 2).then({}, function(response) {
      const error = response.errors[0];

      assert.ok(response);
      assert.equal(error.status, 500);
      assert.equal(error.detail, 'Something bad');
      assert.equal(response.message, 'Internal Server Error');
    });
  });
});

test('Invalid with non field errors', function(assert) {
  return run(function() {

    var post = store.createRecord('post', {
      postTitle: '',
      body: 'non_field_errors'
    });

    return post.save().then({}, function(response) {
      const bodyErrors = post.get('errors.body'),
            nonFieldErrors1 = response.errors[1],
            nonFieldErrors2 = response.errors[2];
      assert.ok(response);
      assert.ok(response.errors);
      assert.equal(post.get('isValid'), false);

      assert.equal(bodyErrors.length, 1);
      assert.equal(bodyErrors[0].message, 'error 1');

      assert.equal(nonFieldErrors1.detail, 'error 2');
      assert.equal(nonFieldErrors1.source.pointer, '/data');
      assert.equal(nonFieldErrors1.title, 'Validation Error');

      assert.equal(nonFieldErrors2.detail, 'error 3');
      assert.equal(nonFieldErrors2.source.pointer, '/data');
      assert.equal(nonFieldErrors2.title, 'Validation Error');

    });
  });
});

test('Create field errors', function(assert) {
  assert.expect(8);

  return run(function() {

    var post = store.createRecord('post', {
      postTitle: '',
      body: ''
    });

    return post.save().then({}, function(response) {
      const postTitleErrors = post.get('errors.postTitle'),
            bodyErrors = post.get('errors.body');
      assert.ok(response);
      assert.ok(response.errors);
      assert.equal(post.get('isValid'), false);

      // Test camelCase field.
      assert.equal(postTitleErrors.length, 1);
      assert.equal(postTitleErrors[0].message, 'This field is required.');

      // Test non-camelCase field.
      assert.equal(bodyErrors.length, 2);
      assert.equal(bodyErrors[0].message, 'This field is required.');
      assert.equal(bodyErrors[1].message, 'This field cannot be blank.');
    });
  });
});

test('Created nested field errors', function(assert) {
  assert.expect(17);

  return run(function() {
    var post = store.createRecord('post');
    var embeddedPostComment = store.createRecord('embedded-post-comment', {
      body: 'This is my new comment',
      post: post
    });

    return embeddedPostComment.save().then(null, function(response) {
      const comment = embeddedPostComment;
      assert.ok(response);
      assert.ok(response.errors);
      assert.notOk(comment.get('isValid'));

      /*
      JSON API technically does not allow nesting, so the nested errors are
      processed as if they were attributes on the comment itself.  As a result,
      comment.get('post.isValid') returns true :-(

      This assertion will fail:
      assert.notOk(comment.get('post.isValid'));

      Related discussion: https://github.com/json-api/json-api/issues/899
      */

      let postErrors = comment.get('errors.post');
      let postBodyErrors = comment.get('errors.post/body');
      let postPostTitleErrors = comment.get('errors.post/post_title');

      assert.equal(postErrors.length, 2);
      assert.equal(postErrors[0].message, 'error 2');
      assert.equal(postErrors[1].message, 'error 3');
      assert.equal(postBodyErrors.length, 2);
      assert.equal(postBodyErrors[0].message, 'This field is required.');
      assert.equal(postBodyErrors[1].message, 'This field cannot be blank.');
      assert.equal(postPostTitleErrors.length, 1);
      assert.equal(postPostTitleErrors[0].message, 'This field is required.');

      let nonFieldError1 = response.errors[3];
      let nonFieldError2 = response.errors[4];

      assert.equal(nonFieldError1.detail, 'error 2');
      assert.equal(nonFieldError1.source.pointer, '/data/attributes/post');
      assert.equal(nonFieldError1.title, 'Validation Error');

      assert.equal(nonFieldError2.detail, 'error 3');
      assert.equal(nonFieldError2.source.pointer, '/data/attributes/post');
      assert.equal(nonFieldError2.title, 'Validation Error');

    });
  });
});

test('Update field errors', function(assert) {
  assert.expect(9);

  return run(function() {

    return store.findRecord('post', 3).then(function(post) {
      assert.ok(post);
      assert.equal(post.get('hasDirtyAttributes'), false);
      post.set('postTitle', 'Lorem ipsum dolor sit amet, consectetur adipiscing el');
      post.set('body', '');
      assert.equal(post.get('hasDirtyAttributes'), true);

      post.save().then({}, function(response) {
        const postTitleErrors = post.get('errors.postTitle'),
              bodyErrors = post.get('errors.body');

        assert.ok(response);
        assert.ok(response.errors);

        // Test camelCase field.
        assert.equal(postTitleErrors.length, 1);
        assert.equal(postTitleErrors[0].message, 'Ensure this value has at most 50 characters (it has 53).');

        // Test non-camelCase field.
        assert.equal(bodyErrors.length, 1);
        assert.equal(bodyErrors[0].message, 'This field is required.');
      });
    });
  });
});
