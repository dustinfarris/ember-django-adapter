# Extending the adapter/serializer

More than likely, you will need to add you own tweaks to the adapter and (more often) the
serializer.  EDA provides blueprints to make this easy.  For example, to make a customizable
serializer for a User model:

```console
ember generate drf-serializer user
```

This will create app/serializers/user.js for you to customize.

Similarly, if you wanted to, for example, extend the adapter on the application level:

```console
ember generate drf-adapter application
```

This will create app/adapters/application.js for you to customize.
