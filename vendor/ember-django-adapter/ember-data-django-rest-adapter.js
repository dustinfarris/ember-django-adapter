// ==========================================================================
// Project:   Ember Data Django Rest Adapter
// Copyright: (c) 2013 Toran Billups http://toranbillups.com
// License:   MIT
// ==========================================================================


// v1.0.6
// c1dc30b (2014-07-27 00:05:25 -0400)


(function() {

var map = Ember.ArrayPolyfills.map;
var forEach = Ember.ArrayPolyfills.forEach;

DS.DjangoRESTSerializer = DS.RESTSerializer.extend({

  init: function() {
    this._super.apply(this, arguments);
  },

  /**
   * @method keyForType
   * @param {String} key
   * @returns String
   */
  keyForType: function(key) {
    return key + "_type";
  },

  /**
   * @method keyForEmbeddedType
   * @param {String} key
   * @returns String
   */
  keyForEmbeddedType: function(key) {
    return 'type';
  },

  extractDjangoPayload: function(store, type, payload) {
    type.eachRelationship(function(key, relationship){
      var embeddedTypeKey, isPolymorphic = false;
      if (relationship.options && relationship.options.polymorphic) {
        isPolymorphic = true;
      }

      if (!Ember.isNone(payload[key]) &&
          typeof(payload[key][0]) !== 'number' &&
            typeof(payload[key][0]) !== 'string' &&
              relationship.kind ==='hasMany') {
        if (Ember.typeOf(payload[key]) === 'array' && payload[key].length > 0) {
          if(isPolymorphic) {
            // If there is a hasMany polymorphic relationship, push each
            // item to the store individually, since they might not all
            // be the same type
            forEach.call(payload[key],function(hash) {
              var type = this.typeForRoot(hash.type);
              this.pushSinglePayload(store,type,hash);
            }, this);
          } else {
            var ids = payload[key].mapBy('id'); //todo find pk (not always id)
            this.pushArrayPayload(store, relationship.type, payload[key]);
            payload[key] = ids;
          }
        }
      }
      else if (!Ember.isNone(payload[key]) && typeof(payload[key]) === 'object' && relationship.kind ==='belongsTo') {
        var type = relationship.type;

        if(isPolymorphic) {
          type = this.typeForRoot(payload[key].type);
        }

        var id = payload[key].id;
        this.pushSinglePayload(store,type,payload[key]);

        if(!isPolymorphic) payload[key] = id;
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
   * This method allows you to push a single object payload.
   *
   * It will first normalize the payload, so you can use this to push
   * in data streaming in from your server structured the same way
   * that fetches and saves are structured.
   *
   * @param {DS.Store} store
   * @param {String} type
   * @param {Object} payload
   */
  pushSinglePayload: function(store, type, payload) {
    type = store.modelFor(type);
    payload = this.extract(store, type, payload, null, "find");
    store.push(type, payload);
  },

  /**
   * This method allows you to push an array of object payloads.
   *
   * It will first normalize the payload, so you can use this to push
   * in data streaming in from your server structured the same way
   * that fetches and saves are structured.
   *
   * @param {DS.Store} store
   * @param {String} type
   * @param {Object} payload
   */
  pushArrayPayload: function(store, type, payload) {
    type = store.modelFor(type);
    payload = this.extract(store, type, payload, null, "findAll");
    store.pushMany(type, payload);
  },

  /**
   * Converts camelcased attributes to underscored when serializing.
   *
   * Stolen from DS.ActiveModelSerializer.
   *
   * @method keyForAttribute
   * @param {String} attribute
   * @returns String
   */
  keyForAttribute: function(attr) {
    return Ember.String.decamelize(attr);
  },

  /**
   * Underscores relationship names when serializing relationship keys.
   *
   * Stolen from DS.ActiveModelSerializer.
   *
   * @method keyForRelationship
   * @param {String} key
   * @param {String} kind
   * @returns String
   */
  keyForRelationship: function(key, kind) {
    return Ember.String.decamelize(key);
  },

  /**
   * Adds support for skipping serialization of
   * DS.attr('foo', { readOnly: true })
   *
   * @method serializeAttribute
   */
  serializeAttribute: function(record, json, key, attribute) {
    if (!attribute.options.readOnly) {
      return this._super(record, json, key, attribute);
    }
  },

  /**
   * Underscore relationship names when serializing belongsToRelationships
   *
   * @method serializeBelongsTo
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
   * Underscore relationship names when serializing hasManyRelationships
   *
   * @method serializeHasMany
   */
  serializeHasMany: function(record, json, relationship) {
    if (relationship.options.polymorphic) {
      // TODO implement once it's implemented in DS.JSONSerializer
      return;
    }

    var key = relationship.key,
    json_key = this.keyForRelationship(key, "hasMany"),
    relationshipType = DS.RelationshipChange.determineRelationshipType(
      record.constructor, relationship);

      if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany') {
        json[json_key] = record.get(key).mapBy('id');
      }
  },

  /**
   * Add the key for a polymorphic relationship by adding `_type` to the
   * attribute and value from the model's underscored name.
   *
   * @method serializePolymorphicType
   * @param {DS.Model} record
   * @param {Object} json
   * @param {Object} relationship
   */
  serializePolymorphicType: function(record, json, relationship) {
    var key = relationship.key,
    belongsTo = Ember.get(record, key);
    key = this.keyForAttribute ? this.keyForAttribute(key) : key;
    if(belongsTo) {
      json[this.keyForType(key)] = Ember.String.underscore(belongsTo.constructor.typeKey);
    } else {
      json[this.keyForType(key)] = null;
    }
  },

  /**
   * Normalize:
   *
   * ```js
   * {
   *   minion: "1"
   *   minion_type: "evil_minion",
   *   author: {
   *     embeddedType: "user",
   *     id: 1
   *   }
   * }
   * ```
   *
   * To:
   *
   * ```js
   * {
   *   minion: "1"
   *   minionType: "evil_minion"
   *   author: {
   *     type: "user",
   *     id: 1
   *   }
   * }
   * ```
   * @method normalizeRelationships
   * @private
   */
  normalizeRelationships: function(type,hash) {
    this._super.apply(this, arguments);

    if (this.keyForRelationship) {
      type.eachRelationship(function(key, relationship) {
        if (relationship.options.polymorphic) {
          var typeKey = this.keyForType(relationship.key);
          if(hash[typeKey]) {
            var typeKeyCamelCase = typeKey.replace(/_type$/,'Type');
            hash[typeKeyCamelCase] = hash[typeKey];
            delete hash[typeKey];
          }

          if(hash[relationship.key]) {
            var embeddedData = hash[relationship.key];
            var embeddedTypeKey = this.keyForEmbeddedType(relationship.key);
            if(embeddedTypeKey !== 'type') {
              if(Ember.isArray(embeddedData) && embeddedData.length) {
                map.call(embeddedData, function(obj,i) {
                  this.normalizeTypeKey(obj,embeddedTypeKey);
                }, this);
              } else if(embeddedData[embeddedTypeKey]) {
                this.normalizeTypeKey(embeddedData,embeddedTypeKey);
              }
            }
          }
        }
      }, this);
    }
  },

  /**
   * Replace a custom type key with a key named `type`.
   *
   * @method normalizeTypeKey
   * @param {Object} obj
   * @param {String} key
   */
  normalizeTypeKey: function(obj,key) {
    obj.type = obj[key];
  }
});


})();

(function() {

var get = Ember.get;

DS.DjangoRESTAdapter = DS.RESTAdapter.extend({
  defaultSerializer: "DS/djangoREST",

  /**
   * Overrides the `pathForType` method to build underscored URLs.
   *
   * Stolen from ActiveModelAdapter
   *
   * ```js
   * this.pathForType("famousPerson");
   * //=> "famous_people"
   * ```
   *
   * @method pathForType
   * @param {String} type
   * @returns String
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
    // Partial updates are expected to be sent as a PATCH
    var isPartial = false;
    record.eachAttribute(function(key, attribute) {
      if(attribute.options.readOnly){
        isPartial = true;
      }
    }, this);
    var method = isPartial ? "PATCH" : "PUT";

    var data = store.serializerFor(type.typeKey).serialize(record);
    var id = get(record, 'id'); //todo find pk (not always id)
    return this.ajax(this.buildURL(type.typeKey, id), method, { data: data });
  },

  findMany: function(store, type, ids, parent) {
    var url, endpoint, attribute;

    if (parent) {
      attribute = this.getHasManyAttributeName(type, parent, ids);
      endpoint = store.serializerFor(type.typeKey).keyForAttribute(attribute);
      url = this.buildFindManyUrlWithParent(type, parent, endpoint);
    } else {
      Ember.assert(
        "You need to add belongsTo for type (" + type.typeKey + "). No Parent for this record was found");
    }

    return this.ajax(url, "GET");
  },

  ajax: function(url, type, hash) {
    hash = hash || {};
    hash.cache = false;

    return this._super(url, type, hash);
  },

  ajaxError: function(jqXHR) {
    var error = this._super(jqXHR);

    if (jqXHR && jqXHR.status === 400) {
      var response = Ember.$.parseJSON(jqXHR.responseText), errors = {};

      Ember.EnumerableUtils.forEach(Ember.keys(response), function(key) {
        errors[Ember.String.camelize(key)] = response[key];
      });

      return new DS.InvalidError(errors);
    } else {
      return error;
    }
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
   * Extract the attribute name given the parent record, the ids of the
   * referenced model, and the type of the referenced model.
   *
   * Given the model definition
   *
   * ```js
   * App.User = DS.Model.extend({
   *   username: DS.attr('string'),
   *   aliases: DS.hasMany('speaker', { async: true}),
   *   favorites: DS.hasMany('speaker', { async: true})
   * });
   * ```
   *
   * with a model object
   *
   * ```js
   * var user1 = {
   *   id: 1,
   *   name: 'name',
   *   aliases: [2,3],
   *   favorites: [4,5]
   * };
   *
   * var type = App.Speaker;
   * var parent = user1;
   * var ids = [4,5];
   * var name = getHasManyAttributeName(type, parent, ids)  // name === "favorites"
   * ```
   *
   * @method getHasManyAttributeName
   * @param {subclass of DS.Model} type
   * @param {DS.Model} parent
   * @param {Array} ids
   * @returns String
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

DS.DjangoDateTransform = DS.Transform.extend({
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
  serialize: function(date) {
    if (date instanceof Date && date.toString() !== 'Invalid Date') {
      return date.toISOString().slice(0, 10);
    } else {
      return null;
    }
  }
});


})();

(function() {

DS.DjangoDatetimeTransform = DS.Transform.extend({
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


})();

(function() {

Ember.Application.initializer({
  name: 'DjangoDatetimeTransforms',

  initialize: function(container, application) {
    application.register('transform:date', DS.DjangoDateTransform);
    application.register('transform:datetime', DS.DjangoDatetimeTransform);
  }
});


})();

(function() {

var VERSION = "1.0.6";

DS.DjangoRESTSerializer.VERSION = VERSION;
DS.DjangoRESTAdapter.VERSION = VERSION;

if (Ember.libraries) {
  Ember.libraries.register("ember-data-django-rest-adapter", VERSION);
}


})();