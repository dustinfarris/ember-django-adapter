# Pagination

Pagination is supported using the metadata support that is built into Ember Data.
Metadata from Django REST Framework paginated list views is updated on every request
to the server.

The pagination support in EDA works with the default pagination setup in DRF 3.0 and the
[PageNumberPagination](http://www.django-rest-framework.org/api-guide/pagination/#pagenumberpagination)
class in DRF 3.1. It's possible to use the other DRF 3.1 pagination classes by
overriding `extractMeta` (see [customizing the Metadata](#customizing-the-metadata) below).


## Accessing the Metadata

To get a page of records, simply run a `query` request with the `page` query param.

```js
let result = this.store.query('post', {page: 1});
```

All of the DRF metadata (including the pagination metadata) can be access through the
`meta` property of the result once the promise is fulfilled.

```js
let meta = result.get('meta');
```

**Note:** The `meta` property will only be set on results of `query` requests.


## Pagination Metadata

The pagination metadata consists of three properties that give the application enough
information to paginate through a Django REST Framework paginated list view.

* `next` - The next page number or `null` when there is no next page (i.e. the last
           page).
* `previous` - The previous page number or `null` when there is no previous page (i.e.
               the first page).
* `count` - The total number of records available. This can be used along with the page
            size to calculate the total number of pages (see
            [customizing the Metadata](#customizing-the-metadata) below).


The `next` and `previous` page number can be used directly as the value of the `page`
query param. `null` is not a valid value for the `page` query param so applications need
to check if `next` and `previous` are null before using them.

```js
if (meta.next) {
  result = store.query('post', {page: meta.next})
}
```

## Customizing the Metadata

You can customize the metadata by overriding the `extractMeta` and adding and / or removing
metadata as indicated in this template.

```js
// app/serializer/<model>.js

import Ember from 'ember';
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  extractMeta: function(store, type, payload) {
    let meta = this._super(store, type, payload);
    if (!Ember.isNone(meta)) {

      // Add or remove metadata here.

    }
    return meta;
  }
});
```

This version of `extractMeta` adds the total page count to the `post` metadata.

```js
// app/serializer/post.js

import Ember from 'ember';
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  extractMeta: function(store, type, payload) {
    let meta = this._super(store, type, payload);
    if (!Ember.isNone(meta)) {
      // Add totalPages to metadata.
      let totalPages = 1;
      if (!Ember.isNone(meta.next)) {
        // Any page that is not the last page.
        totalPages = Math.ceil(meta.count / payload.results.length);
      } else if (Ember.isNone(meta.next) && !Ember.isNone(meta.previous)) {
        // The last page when there is more than one page.
        totalPages = meta.previous + 1;
      }
      meta['totalPages'] = totalPages;
    }
    return meta;
  }
});
```

## Cursor Pagination

To use [`CursorPagination`](http://www.django-rest-framework.org/api-guide/pagination/#cursorpagination), override `extractPageNumber` in the serializer to extract the `cursor`.

```js
// app/serializer/drf.js

import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default DRFSerializer.extend({
  extractPageNumber: function(url) {
    var match = /.*?[\?&]cursor=([A-Za-z0-9]+).*?/.exec(url);
    if (match) {
      return match[1];
    }
    return null;
  }
});
```

If you don't use the `PageNumberPagination` for pagination with DRF 3.1 you can also add
the metadata for the pagination scheme you use here. We may add support for the other
pagination classes in the future. If this is something you are interested in contributing,
please file an issue on github.
