import DS from 'ember-data';

export default DS.Model.extend({
  postTitle: DS.attr(),
  body: DS.attr(),
  comments: DS.hasMany('comment', {async: true})
});
