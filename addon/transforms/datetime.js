import Ember from 'ember';
import DS from "ember-data";

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (typeof serialized === 'string') {
      return new Date(Ember.Date.parse(serialized));
    } else if (typeof serialized === 'number') {
      return new Date(serialized);
    } else if (Ember.isEmpty(serialized)) {
      return serialized;
    } else {
      return null;
    }
  },
  serialize: function(datetime) {
    if (datetime instanceof Date && datetime.toString() !== 'Invalid Date') {
      return datetime.toJSON();
    } else {
      return null;
    }
  }
});
