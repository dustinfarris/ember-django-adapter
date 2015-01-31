# Trailing Slashes


By default, Django REST Framework adds trailing slashes to its generated URLs.
EDA is set up to handle this, however, if you have decided to opt out of
trailing slashes, you will need to extend the adapter with this configuration.

e.g., if you have set up a router in DRF that is instantiated like this:

```python
from rest_framework import routers


router = routers.DefaultRouter(trailing_slash=False)
```

then you will need to [extend](extending.md) the adapter and switch off
`addTrailingSlashes` in `app/adapters/application.js`:

```js
// app/adapters/application.js

import DRFAdapter from './drf';

export default DRFAdapter.extend({
  addTrailingSlashes: false
});
```
