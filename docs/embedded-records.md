# Embedded Records

Let's say you've set up a serializer in DRF that has embedded records.  For example:

```python
class Person(models.Model):
    name = models.CharField(max_length=20)


class Pet(models.Model):
    name = models.CharField(max_length=20)
    owner = models.ForeignKey(Person, related_name='pets')


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet


class PersonSerializer(serializers.ModelSerializer):
    pets = PetSerializer(many=True)

    class Meta:
        model = Person
```

On the Ember side, your models would look like this:

```js
// app/models/pet.js

import DS from 'ember-data';

export default DS.Model.extend({
  person: DS.belongsTo('person'),
  name: DS.attr('string')
});
```

```js
// app/models/person.js

import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  pets: DS.hasMany('pet')
});
```

The API's JSON response from such a setup would look something like this:

```json
{
  "id": 2,
  "name": "Frank",
  "pets": [
    { "id": 1, "name": "Spot" },
    { "id": 2, "name": "Fido" }
  ]
}
```

Ember Data supports this sort of response (since 1.0.0-beta.10), but you will have to extend the
serializer for this model to make Ember Data aware of it.

In your Ember project, create a DRF serializer for your Person model.

```console
ember generate drf-serializer person
```

This creates a skeleton serializer that extends the DRF serializer in app/serializers/person.js.
Modify this file to support the embedded records:

```js
// app/serializers/person.js

import DRFSerializer from './drf';
import DS from 'ember-data';

export default DRFSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    pets: { embedded: 'always' }
  }
});
```


### Writable nested records

Writable nested records are not supported by the adapter at this time.
