# Contributing to Ember Django Adapter

We welcome all bug reports and pull requests.

Issues: [github.com/dustinfarris/ember-django-adapter/issues][1]


## Local Development

To run ember-django-adapter locally, you will have to use `npm link`.

```
git clone git@github.com:dustinfarris/ember-django-adapter
cd ember-django-adapter
npm i && bower i
npm link
```

Then in a test ember-cli project, you will have to install a couple bower dependencies separately.
These are not actually required in the test ember-cli project, but errors will be thrown if they
are not present.

```
cd test-ember-cli-project
bower i pretender
bower i http://sinonjs.org/releases/sinon-1.12.1.js
npm link ember-django-adapter
```

Now your test project is using a symlinked copy of your local ember-django-adapter, and any changes
you make to the adapter will be reflected in your project in real-time.


## Running tests

You can run tests with the latest supported Ember Data beta with:

```
ember test
```

You can also run tests against Ember Data canary with:

```
ember try ember-data-canary
```


[1]: https://github.com/dustinfarris/ember-django-adapter/issues
