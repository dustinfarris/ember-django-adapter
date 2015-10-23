# Coalescing Find Requests

When a record returns the IDs of records in a hasMany relationship, Ember Data
allows us to opt-in to combine these requests into a single request.

**Note:** Using [hyperlinked related fields](hyperlinked-related-fields.md) to retrieve related
records in a single request is preferred over using coalesceFindRequests since there is a limit on
the number of records per request on read-only fields due to URL length restrictions. 

Suppose you have Ember models:

```js
// app/models/person.js

import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  pets: DS.hasMany('pet', { async: True })
});


// app/models/pet.js

import DS from 'ember-data';

export default DS.Model.extend({
  age: DS.attr('number')
});
```

An out-of-the-box DRF model serializer for Person would return something like
this:

```
GET /api/people/1/

{
  "id": 1,
  "name": "Fred",
  "pets": [1, 2, 3]
}
```

When Ember Data decides to resolve the pets, by default it would fire 3
separate requests.  In this case:

```
GET /api/pets/1/

{
  "id": 1,
  "age": 5
}

GET /api/pets/2/

{
  "id": 2,
  "age": 5
}

GET /api/pets/3/

{
  "id": 3,
  "age": 6
}
```

However, if we opt-in to coalesceFindRequests, we can consolidate this into
1 call.


## Enable coalesceFindRequests

[Extend](extending.md) the adapter, and enable coalesceFindRequests:

```js
// app/adapters/application.js

import DRFAdapter from './drf';

export default DRFAdapter.extend({
  coalesceFindRequests: true
});
```

Now, when Ember Data resolves the pets, it will fire a request that looks like
this:

```
GET /api/pets/?ids[]=1&ids[]=2&ids[]=3
```


## CoalesceFilterBackend

All this is great, except Django REST Framework is not quite able to handle such a
request out of the box.  Thankfully, DRF
[allows you to plug in custom filters](http://www.django-rest-framework.org/api-guide/filtering/#setting-filter-backends),
and writing a filter for this kind of request is super simple.

In your project somewhere, write the following filter:

```python
# myapp/filters.py

from rest_framework import filters


class CoalesceFilterBackend(filters.BaseFilterBackend):
    """
    Support Ember Data coalesceFindRequests.

    """
    def filter_queryset(self, request, queryset, view):
        id_list = request.QUERY_PARAMS.getlist('ids[]')
        if id_list:
            # Disable pagination, so all records can load.
            view.pagination_class = None
            queryset = queryset.filter(id__in=id_list)
        return queryset
```

Now you just need to add this filter to `filter_backends` in your views, e.g.:

```python
from myapp.filters import CoalesceFilterBackend


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer = UserSerializer
    filter_backends = (CoalesceFilterBackend,)
```

Or, configure it globally in your DRF settings:

```python
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ('myapp.filters.CoalesceFilterBackend',)
}
```

Now, when Ember Data sends the coalesced request, DRF will return meaningful
data:

```
GET /api/pets/?ids[]=1&ids[]=2&ids[]=3

[
  {
    "id": 1,
    "age": 5
  },
  {
    "id": 2,
    "age": 5
  },
  {
    "id": 3,
    "age": 6
  }
]
```
