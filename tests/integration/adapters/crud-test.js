import { moduleFor, test } from 'ember-qunit';

import startApp from '../../helpers/start-app';
import Ember from 'ember';
import DS from 'ember-data';

var App;

moduleFor('adapter:application', 'DRFAdapater', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('it exists', function() {
  var adapter = this.subject();
  ok(adapter);
});

// https://stackoverflow.com/questions/26317855/ember-cli-how-to-do-asynchronous-model-unit-testing-with-restadapter
test('GET works for a list of records', function() {
  var record,
    store = App.__container__.lookup('store:main');
  ok(store);

  stop();
  Ember.run(function(){
    store.find('post').then(function(response) {
      ok(response);

      start();
      equal(response.get('length'), 20);

      var post = response.objectAt(19);
      equal(post.get('title'), 'post title 20');
      equal(post.get('body'), 'post body 20');
    });
  });
});

