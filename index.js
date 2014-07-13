(function() {
  'use strict';

  var path = require('path');
  var fs   = require('fs');

  function EmberDjangoAdapter(project) {
    this.project = project;
    this.name    = "Ember CLI Django Adapter";
  }

  EmberDjangoAdapter.prototype.blueprintsPath = function() {
    return __dirname + '/blueprints';
  };

  function unwatchedTree(dir) {
    return {
        read:    function() { return dir; },
        cleanup: function() { }
      };
  }

  EmberDjangoAdapter.prototype.treeFor = function treeFor(name) {
    var treePath = path.join('node_modules', 'ember-django-adapter', name + '-addon');

    if (fs.existsSync(treePath)) {
      return unwatchedTree(treePath);
    }
  };

  EmberDjangoAdapter.prototype.included = function included(app) {
    this.app = app;

    this.app.import({
      development: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.js',
      production: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.prod.js'
    });
  };

  module.exports = EmberDjangoAdapter;
}());
