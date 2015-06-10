# Pagination

Pagination is supported using the metadata support that is built into Ember Data.
Metadata from Django REST Framework paginated list views is updated on every request
to the server.


## Retrieving the Metadata

To get a page of records, simply run a find request with the `page` query param:

```js
var result = this.store.find("post", {
  page: 2
});
```

After the request returns, you can access the metadata either with `store.metadataFor`:

```js
var meta = this.store.metadataFor("post");
```

Or you can access the metadata just for this query:

```js
var meta = result.get("content.meta");
```

**NB** Running a find request against a paginated list view without query params will
retrieve the first page with metadata set in only `store.metadataFor`. This is how
metadata works in Ember Data.


## Metadata Properties

The metadata consists of three properties that give the application enough information
to paginate through a Django REST Framework paginated list view.

* `next` - The next page number or `null` when there is no next page (i.e. the last
           page).
* `previous` - The previous page number or `null` when there is no previous page (i.e.
               the first page).
* `count` - The total number of records available. This can be used along with the page
            size to calculate the total number of pages.


The `next` and `previous` page number can be used directly as the value of the `page`
query param. `null` is not a valid value for the `page` query param so applications need
to check this condition before using it.

```js
if (meta.next) {
  store.find('post', {page: meta.next})
}
```

## Django REST Framework settings

Django REST Framework has a number of settings that can be used to customise the
pagination behaviour of generic views.

One useful setting is `PAGINATE_BY_PARAM` / `paginate_by_param`. If this is enabled,
it's possible to override the server-side page size by including the query param
name that you set in the find request. For example, if you set
`PAGINATE_BY_PARAM = 'page_size'`, you would run the find request with the `page`
 and `page_size` query params. For example:

```js
var result = this.store.find("post", {
  page: 1,
  page_size: 10
});
```

If you use the `PAGINATE_BY_PARAM` or `paginate_by_param` setting, it's advisable to also
set `MAX_PAGINATE_BY`.

These global settings serve as a good starting point for your Django REST Framework pagination configuration:

```Python
REST_FRAMEWORK = {
    'PAGINATE_BY': 10,                 # Default to 10
    'PAGINATE_BY_PARAM': 'page_size',  # Allow client to override, using `?page_size=xxx`.
    'MAX_PAGINATE_BY': 100             # Maximum limit allowed when using `?page_size=xxx`.
}
```

The complete pagination configuration documentation is available in Django REST Framework docs.

[http://www.django-rest-framework.org/api-guide/pagination/#pagination-in-the-generic-views](http://www.django-rest-framework.org/api-guide/pagination/#pagination-in-the-generic-views)


## Integration with 3rd Party Libraries

* Ember CLI Pagination

[https://github.com/mharris717/ember-cli-pagination](https://github.com/mharris717/ember-cli-pagination)

Add a total_pages key in API response by making a CustomPageNumberPagination class
```python
REST_FRAMEWORK = {
  'DEFAULT_PAGINATION_CLASS': 'utils.pagination.CustomPageNumberPagination'
}
```

```python
//utils.pagination.py
from rest_framework.compat import OrderedDict
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPageNumberPagination(PageNumberPagination):
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('total_pages', self.page.paginator.num_pages),
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))
```

Then override ```extractMeta``` function of the DRFSerializer in your model serializer

```js
//app/serializer/post.js
import DRFSerializer from './drf';
import DS from 'ember-data';

export default DRFSerializer.extend(DS.EmbeddedRecordsMixin, {
    extractMeta: function(store, type, payload) {
        if (payload && payload.results) {
          // Sets the metadata for the type.
          store.setMetadataFor(type, {
            count: payload.count,
            next: this.extractPageNumber(payload.next),
            previous: this.extractPageNumber(payload.previous),
            total_pages: payload.total_pages
          });

          // Keep ember data from trying to parse the metadata as a records
          delete payload.count;
          delete payload.next;
          delete payload.previous;
          delete payload.total_pages;
        }
    },
});
```
