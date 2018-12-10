import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';

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

module('Acceptance: Pagination', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

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
        if (previousPage > 1) {
          previousUrl = '/test-api/posts/?page=' + previousPage;
        } else if (previousPage === 1) {
          // The DRF previous URL doesn't always include the page=1 query param in the results for page 2.
          previousUrl = '/test-api/posts/';
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
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('Retrieve list of paginated records', function(assert) {
    assert.expect(7);

    return store.query('post', {page: 1}).then(function(response) {
      assert.ok(response);

      assert.equal(response.get('length'), 4);

      // Test the camelCase and non-camelCase fields of a paginated result.
      var post = response.objectAt(1);
      assert.equal(post.get('postTitle'), 'post title 2');
      assert.equal(post.get('body'), 'post body 2');

      var metadata = response.get('meta');
      assert.equal(metadata.count, 6);
      assert.equal(metadata.next, 2);
      assert.equal(metadata.previous, null);
    });
  });

  test('queryRecord with paginated results returns a single record', function(assert) {
    return store.queryRecord('post', { title: 'post title 1' }).then(function(post) {
      assert.ok(post);
      assert.equal(post.get('postTitle'), 'post title 1');
      assert.equal(post.get('body'), 'post body 1');
    });
  });

  test("Type metadata doesn't have previous", function(assert) {
    assert.expect(4);

    return store.query('post', {page: 1}).then(function(response) {
      assert.ok(response);

      var metadata = response.get('meta');
      assert.equal(metadata.count, 6);
      assert.equal(metadata.next, 2);
      assert.equal(metadata.previous, null);
    });
  });


  test("Type metadata doesn't have next", function(assert) {
    assert.expect(5);

    return store.query('post', {page: 2}).then(function(response) {
      assert.ok(response);
      assert.equal(response.get('length'), 2);

      var metadata = response.get('meta');
      assert.equal(metadata.count, 6);
      assert.equal(metadata.next, null);
      assert.equal(metadata.previous, 1);
    });
  });


  test("Test page_size query param", function(assert) {
    assert.expect(5);

    return store.query('post', {page: 2, page_size: 2}).then(function(response) {
      assert.ok(response);
      assert.equal(response.get('length'), 2);

      var metadata = response.get('meta');
      assert.equal(metadata.count, 6);
      assert.equal(metadata.previous, 1);
      assert.equal(metadata.next, 3);
    });
  });
});
