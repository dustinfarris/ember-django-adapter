import DateTimeTransform from "ember-django-adapter/transforms/datetime";

export default {
  name: "django-adapter",

  initialize: function(container) {
    container.register('transform:datetime', DateTimeTransform);
  }
};
