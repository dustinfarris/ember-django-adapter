import DRFAdapter from 'ember-django-adapter/adapters/drf';

var ApplicationAdapter = DRFAdapter.extend({
  host: 'http://localhost:8000',
  namespace: 'api'
});

export default ApplicationAdapter;
