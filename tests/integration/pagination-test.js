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
  },
  {
    id: 4,
    post_title: 'post title 4',
    body: 'post body 4',
    comments: []
  },
  {
    id: 5,
    post_title: 'post title 5',
    body: 'post body 5',
    comments: []
  },
  {
    id: 6,
    post_title: 'post title 6',
    body: 'post body 6',
    comments: []
  }
];

module('Pagination', {
  setup: function() {
    App = startApp();

    store = App.__container__.lookup('store:main');

    // The implementation of the paginated Pretender server is dynamic
    // so it can be used with all of the pagination tests. Otherwise,
    // different urls would need to be used which would require new
    // models.
    server = new Pretender(function() {
      this.get('/test-api/posts/', function(request) {
        var page = 1,
          pageSize = 4;

        if (request.queryParams.page_size !== undefined) {
          pageSize = Number(request.queryParams.page_size).valueOf();
        }

        var maxPages = posts.length / pageSize;

        if (posts.length % pageSize > 0) {
          maxPages++;
        }

        if (request.queryParams.page !== undefined) {
          page = Number(request.queryParams.page).valueOf();
          if (page > maxPages) {
            return [404, {'Content-Type': 'text/html'}, '<h1>Page not found</h1>'];
          }
        }

        var nextPage = page + 1;
        var nextUrl = null;
        if (nextPage <= maxPages) {
          nextUrl = '/test-api/posts/?page=' + nextPage;
        }

        var previousPage = page - 1;
        var previousUrl = null;
        if (previousPage >= 1) {
          previousUrl = '/test-api/posts/?page=' + previousPage;
        }

        var offset = (page - 1) * pageSize;
        return [200, {'Content-Type': 'application/json'}, JSON.stringify({
          count: posts.length,
          next: nextUrl,
          previous: previousUrl,
          results: posts.slice(offset, offset + pageSize)
        })];
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
test('Retrieve list of paginated records', function() {
  expect(8);

  stop();
  Ember.run(function() {
    store.find('post').then(function(response) {
      ok(response);

      equal(response.get('length'), 4);

      // Test the camelCase and non-camelCase fields of a paginated result.
      var post = response.objectAt(1);
      equal(post.get('postTitle'), 'post title 2');
      equal(post.get('body'), 'post body 2');

      // Test the type metadata.
      var metadata = store.metadataFor('post');
      equal(metadata.count, 6);
      equal(metadata.next, 2);
      equal(metadata.previous, null);

      // No metadata on results when using find without query params.
      ok(!response.get('meta'));

      start();
    });
  });
});


test("Type metadata doesn't have previous", function() {
  expect(5);

  stop();
  Ember.run(function() {
    store.find('post').then(function(response) {
      ok(response);

      // Test the type metadata.
      var metadata = store.metadataFor('post');
      equal(metadata.count, 6);
      equal(metadata.next, 2);
      equal(metadata.previous, null);

      // No metadata on results when using find without query params.
      ok(!response.get('meta'));

      start();
    });
  });
});


test("Type metadata doesn't have next", function() {
  expect(8);

  stop();
  Ember.run(function() {
    store.find('post', {page: 2}).then(function(response) {
      ok(response);
      equal(response.get('length'), 2);

      // Test the type metadata.
      var typeMetadata = store.metadataFor('post');
      equal(typeMetadata.count, 6);
      equal(typeMetadata.next, null);
      equal(typeMetadata.previous, 1);

      // Test the results metadata.
      var resultsMetadata = response.get('meta');
      equal(resultsMetadata.count, 6);
      equal(resultsMetadata.next, null);
      equal(resultsMetadata.previous, 1);

      start();
    });
  });
});


test("Test page_size query param", function() {
  expect(8);

  stop();
  Ember.run(function() {
    store.find('post', {page: 2, page_size: 2}).then(function(response) {
      ok(response);
      equal(response.get('length'), 2);

      // Test the type metadata.
      var typeMetadata = store.metadataFor('post');
      equal(typeMetadata.count, 6);
      equal(typeMetadata.previous, 1);
      equal(typeMetadata.next, 3);

      // Test the results metadata.
      var resultsMetadata = response.get('meta');
      equal(resultsMetadata.count, 6);
      equal(resultsMetadata.previous, 1);
      equal(resultsMetadata.next, 3);

      start();
    });
  });
});
