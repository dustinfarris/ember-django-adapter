// ==========================================================================
// Project:   Ember Data Django Rest Adapter
// Copyright: (c) 2013 Toran Billups http://toranbillups.com
// License:   MIT
// ==========================================================================


// v1.0.3
// cbd7510 (2014-05-14 16:35:54 -0400)


(function() {

DS.DjangoRESTSerializer = DS.RESTSerializer.extend({

    init: function() {
        this._super.apply(this, arguments);
    },

    extractDjangoPayload: function(store, type, payload) {
        type.eachRelationship(function(key, relationship){
            if (!Ember.isNone(payload[key]) &&
                typeof(payload[key][0]) !== 'number' &&
                typeof(payload[key][0]) !== 'string' &&
                relationship.kind ==='hasMany') {
              if (Ember.typeOf(payload[key]) === 'array' && payload[key].length > 0) {
                var ids = payload[key].mapBy('id'); //todo find pk (not always id)
                this.pushArrayPayload(store, relationship.type, payload[key]);
                payload[key] = ids;
              }
            }
            else if (!Ember.isNone(payload[key]) && typeof(payload[key]) === 'object' && relationship.kind ==='belongsTo') {
                var id=payload[key].id;
                this.pushSinglePayload(store,relationship.type,payload[key]);
                payload[key]=id;
            }
        }, this);
    },

    extractSingle: function(store, type, payload) {
        // using normalize from RESTSerializer applies transforms and allows
        // us to define keyForAttribute and keyForRelationship to handle
        // camelization correctly.
        this.normalize(type, payload);
        this.extractDjangoPayload(store, type, payload);
        return payload;
    },

    extractArray: function(store, type, payload) {
        var self = this;
        for (var j = 0; j < payload.length; j++) {
            // using normalize from RESTSerializer applies transforms and allows
            // us to define keyForAttribute and keyForRelationship to handle
            // camelization correctly.
            this.normalize(type, payload[j]);
            self.extractDjangoPayload(store, type, payload[j]);
        }
        return payload;
    },

    /**
      This method allows you to push a single object payload.

      It will first normalize the payload, so you can use this to push
      in data streaming in from your server structured the same way
      that fetches and saves are structured.

      @param {DS.Store} store
      @param {String} type
      @param {Object} payload
    */
    pushSinglePayload: function(store, type, payload) {
        type = store.modelFor(type);
        payload = this.extract(store, type, payload, null, "find");
        store.push(type, payload);
    },

    /**
      This method allows you to push an array of object payloads.

      It will first normalize the payload, so you can use this to push
      in data streaming in from your server structured the same way
      that fetches and saves are structured.

      @param {DS.Store} store
      @param {String} type
      @param {Object} payload
    */
    pushArrayPayload: function(store, type, payload) {
        type = store.modelFor(type);
        payload = this.extract(store, type, payload, null, "findAll");
        store.pushMany(type, payload);
    },

    /**
      Converts camelcased attributes to underscored when serializing.

      Stolen from DS.ActiveModelSerializer.

      @method keyForAttribute
      @param {String} attribute
      @returns String
    */
    keyForAttribute: function(attr) {
        return Ember.String.decamelize(attr);
    },

    /**
      Underscores relationship names when serializing relationship keys.

      Stolen from DS.ActiveModelSerializer.

      @method keyForRelationship
      @param {String} key
      @param {String} kind
      @returns String
    */
    keyForRelationship: function(key, kind) {
        return Ember.String.decamelize(key);
    },

    /**
      Underscore relationship names when serializing belongsToRelationships

      @method serializeBelongsTo
    */
    serializeBelongsTo: function(record, json, relationship) {
        var key = relationship.key;
        var belongsTo = record.get(key);
        var json_key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;

        if (Ember.isNone(belongsTo)) {
          json[json_key] = belongsTo;
        } else {
          if (typeof(record.get(key)) === 'string') {
            json[json_key] = record.get(key);
          }else{
            json[json_key] = record.get(key).get('id');
          }
        }

        if (relationship.options.polymorphic) {
          this.serializePolymorphicType(record, json, relationship);
        }
    },

    /**
      Underscore relationship names when serializing hasManyRelationships

      @method serializeHasMany
    */
    serializeHasMany: function(record, json, relationship) {
        var key = relationship.key,
            json_key = this.keyForRelationship(key, "hasMany"),
            relationshipType = DS.RelationshipChange.determineRelationshipType(
                record.constructor, relationship);

        if (relationshipType === 'manyToNone' ||
            relationshipType === 'manyToMany')
            json[json_key] = record.get(key).mapBy('id');
    }

});


})();

(function() {

var get = Ember.get;

DS.DjangoRESTAdapter = DS.RESTAdapter.extend({
    defaultSerializer: "DS/djangoREST",

    /**
      Overrides the `pathForType` method to build underscored URLs.

      Stolen from ActiveModelAdapter

      ```js
        this.pathForType("famousPerson");
        //=> "famous_people"
      ```

      @method pathForType
      @param {String} type
      @returns String
    */
    pathForType: function(type) {
        var decamelized = Ember.String.decamelize(type);
        return Ember.String.pluralize(decamelized);
    },


    createRecord: function(store, type, record) {
        var url = this.buildURL(type.typeKey);
        var data = store.serializerFor(type.typeKey).serialize(record);
        return this.ajax(url, "POST", { data: data });
    },

    updateRecord: function(store, type, record) {
        var data = store.serializerFor(type.typeKey).serialize(record);
        var id = get(record, 'id'); //todo find pk (not always id)
        return this.ajax(this.buildURL(type.typeKey, id), "PUT", { data: data });
    },

    findMany: function(store, type, ids, parent) {
        var url, endpoint, attribute;

        if (parent) {
            attribute = this.getHasManyAttributeName(type, parent, ids);
            endpoint = store.serializerFor(type.typeKey).keyForAttribute(attribute);
            url = this.buildFindManyUrlWithParent(type, parent, endpoint);
        } else {
            ;
        }

        return this.ajax(url, "GET");
    },

    ajax: function(url, type, hash) {
        hash = hash || {};
        hash.cache = false;

        return this._super(url, type, hash);
    },

    buildURL: function(type, id) {
        var url = this._super(type, id);

        if (url.charAt(url.length -1) !== '/') {
            url += '/';
        }

        return url;
    },

    buildFindManyUrlWithParent: function(type, parent, endpoint) {
        var root, url, parentValue;

        parentValue = parent.get('id'); //todo find pk (not always id)
        root = parent.constructor.typeKey;
        url = this.buildURL(root, parentValue);

        return url + endpoint + '/';
    },

    /**
      Extract the attribute name given the parent record, the ids of the referenced model, and the type of
      the referenced model.

      Given the model definition

      ````
      App.User = DS.Model.extend({
          username: DS.attr('string'),
          aliases: DS.hasMany('speaker', { async: true})
          favorites: DS.hasMany('speaker', { async: true})
      });
      ````

      with a model object

      ````
      user1 = {
          id: 1,
          name: 'name',
          aliases: [2,3],
          favorites: [4,5]
      }
      
      type = App.Speaker;
      parent = user1;
      ids = [4,5]
      name = getHasManyAttributeName(type, parent, ids) // name === "favorites"
      ````

      @method getHasManyAttributeName
      @param {subclass of DS.Model} type
      @param {DS.Model} parent
      @param {Array} ids
      @returns String
    */
    getHasManyAttributeName: function(type, parent, ids) {
      var attributeName;
      parent.eachRelationship(function(name, relationship){
        var relationshipIds;
        if (relationship.kind === "hasMany" && relationship.type.typeKey === type.typeKey) {
          relationshipIds = parent._data[name].mapBy('id');
          // check if all of the requested ids are covered by this attribute
          if (Ember.EnumerableUtils.intersection(ids, relationshipIds).length === ids.length) {
            attributeName = name;
          }
        }
      });

      return attributeName;
    }

});


})();

(function() {

var VERSION = "1.0.3";

DS.DjangoRESTSerializer.VERSION = VERSION;
DS.DjangoRESTAdapter.VERSION = VERSION;

if (Ember.libraries) {
  Ember.libraries.register("ember-data-django-rest-adapter", VERSION);
}



})();