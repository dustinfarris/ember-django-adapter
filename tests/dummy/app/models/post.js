import DS from "ember-data";

var Post = DS.Model.extend({
  title: DS.attr(),
  body: DS.attr(),
  comments: DS.hasMany('comment')
});

export default Post;
