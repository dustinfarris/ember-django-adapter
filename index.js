(function() {
  'use strict';

  var path = require('path');
  var fs   = require('fs');

  function EmberCLIDjangoAdapter(project) {
    this.project = project;
    this.name    = "Ember CLI Django Adapter";
  }

  function unwatchedTree(dir) {
    return {
        read:    function() { return dir; },
        cleanup: function() { }
      };
  }

  EmberCLIDjangoAdapter.prototype.treeFor = function treeFor(name) {
    var treePath = path.join('node_modules', 'ember-django-adapter', name + '-addon');

    if (fs.existsSync(treePath)) {
      return unwatchedTree(treePath);
    }
  };

  EmberCLIDjangoAdapter.prototype.included = function included(app) {
    this.app = app;

    this.app.import({
      development: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.js',
      production: 'vendor/ember-django-adapter/ember-data-django-rest-adapter.min.js'
    });
  };

  module.exports = EmberCLIDjangoAdapter;
}());
