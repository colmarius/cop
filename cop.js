//     Cop.js 0.0.3
//
//     (c) 2012 Marius Colacioiu
//     Cop library may be freely distributed under Apache 2.0 license.
//     For all details and documention:
//     (url)
    
(function(){
  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, 
  // `global`on the server).
  var root = this;

  // The top-level namespace. All public Cop classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Cop;
  if (typeof exports !== 'undefined')
    Cop = exports; 
  else
    Cop = root.Cop = {};

  // Current version of the library.
  Cop.VERSION = '0.0.3';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) 
    _ = require('underscore');

  // Require Backbone, if we're on the server, and it's not already present.
  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined'))
    Backbone = require('backbone');

  // Require Traits, if we're on the server, and it's not already present.
  var Trait = root.Trait;
  if (!Trait && (typeof require !== 'undefined'))
    Trait = require('traits').Trait;
  
  // Cop.Context
  // -----------
  
  Cop.Context = function(name) {
    if (!name || name === "")
      throw new Error("Context object must have a name.");
    
    this.name = name;
    this._objects = [];
    this._traits = [];
  };

  _.extend(Cop.Context.prototype, Backbone.Events, {

    setAdaptation: function(object, trait) {
      if (object === root)
        throw new Error("Cannot adapt the global object.");

      this._objects.push(object);
      this._traits.push(trait);
    },

    getAdaptation: function(object) {
      for (var i = 0, l = this._objects.length; i < l; i++) {
        if (this._objects[i] === object)
          return {object: this._objects[i], trait: this._traits[i]};
      }
    }

  });

  // Cop.ContextManager
  // ------------------
  
  Cop.ContextManager = function(options) {
    this._configure(options || {});
    this.initialize.apply(this, arguments);
  };

  _.extend(Cop.ContextManager.prototype, Backbone.Events, {

    initialize: function() {},

    getContext: function(name) {
      return this.contexts.lookup(name);
    },

    getRelation: function(context) {
      var relation = this.relations.lookup(context);
      if (relation)
        return {context: context, 
                include: relation.include,
                exclude: relation.exclude};
    },

    _configure: function(options) {
      var contexts = new Dictionary();
      var relations = new Dictionary();

      function checkContext(name) {
        if (name == undefined)
          throw new Error("Context undefined.");
        else if (!contexts.contains(name))
          throw new Error("Unregistered context '" + name + "'.");
      }

      function parse(relation, type) {
        var relationArray = relation[type];
        
        if (relationArray == undefined)
          return;
        else if (!_.isArray(relationArray) && !_.isString(relationArray))
          delete relation[type];
        else if (_.isString(relationArray))
          relationArray = [relationArray];

        _.each(relationArray, function(name) {
          checkContext(name);
        });
        
				return relationArray;
      }

      if (this.options) 
        options = _.extend({}, this.options, options);

      if (options.contexts) {
        _.each(options.contexts, function(name) {
          if (contexts.contains(name))
            throw new Error("Context manager has context: " + name + ".");
          else
            contexts.store(name, new Cop.Context(name));
        });
      }
      
      if (options.relations) {
        _.each(options.relations, function(relation, contextName) {
          checkContext(contextName);
          relation.include = parse(relation, 'include');
          relation.exclude = parse(relation, 'exclude');
          // If checks passed Ok store context relation.
          relations.store(contextName, relation);
        });
      }

      this.options = options;
      this.contexts = contexts;
      this.relations = relations;
      this.currentActive = {};
      this.toActivate = {};
      this.toDeactivate = {};
    }

  });


  // Helpers
  // -------

  function Dictionary(startValues) {
    this.values = _.clone(startValues) || {};
  }

  _.extend(Dictionary.prototype, {
    
    store: function(name, value) {
      this.values[name] = value;
    },
    
    lookup: function(name) {
      return this.values[name];
    },
    
    contains: function(name) {
      return Object.prototype.hasOwnProperty.call(this.values, name) &&
        Object.prototype.propertyIsEnumerable.call(this.values, name);
    },
    
    each: function(action) {
      _.each(this.values, action);
    }

  });

}).call(this);
