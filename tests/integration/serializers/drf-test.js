import { moduleFor, test } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';

var App;

moduleFor('serializer:application', 'DRFSerializer', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

// Replace this with your real tests.
test('it exists', function() {
  var serializer = this.subject();
  ok(serializer);
});
