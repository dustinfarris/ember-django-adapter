import DS from "ember-data";

var Comment = DS.Model.extend({
  body: DS.attr(),
  post: DS.belongsTo('post')
});

export default Comment;
