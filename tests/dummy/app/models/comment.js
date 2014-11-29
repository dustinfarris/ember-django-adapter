import DS from 'ember-data';

export default DS.Model.extend({
  body: DS.attr(),
  post: DS.belongsTo('post')
});
