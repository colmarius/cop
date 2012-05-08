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
  
  // Debug log messages to console.
  var log = console.log;

  // Cop.Context
  // -----------
  
  Cop.Context = function(options) {
    this._configure(options || {});
    //this.initialize.apply(this, arguments);
  };

  _.extend(Cop.Context.prototype, Backbone.Events, {

    initialize: function() {},

    // destroy: function() {},

    activate: function() {
      if (!this.active) {
        this.active = true;
        this.trigger("activate", this);
      }
    },

    deactivate: function() {
      if (this.active) {
        this.active = false;
        this.trigger("deactivate", this);
      }
    },

    setAdaptation: function(object, trait) {
      if (!_.isObject(object))
        throw new Error("Only objects can be adapted.");

      if (object === root)
        throw new Error("Cannot adapt the global object.");
      
      this.adaptations.push({object: object, trait: trait});
    },

    getAdaptation: function(object) {
      return _.find(this.adaptations, function(adaptation) {
        return adaptation.object === object;
      });
    },

    _configure: function(options) {      
      if (!options.name || options.name === "")
        throw new Error("Context object must have a name.");
        
      this.name = options.name;
      this.active = false;
      this.adaptations = [];

      if (_.isFunction(options.initialize))
        this.initialize = options.initialize;
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

    onActivate: function(context) {
      console.log(context.name, " is now active.");
    },

    onDeactivate: function(context) {
      console.log(context.name, " is now inactive.");
    },

    _configure: function(options) {
      var self = this;
      var contexts = new Dictionary();
      var relations = new Dictionary();
      
      if (!_.isArray(options.contexts)) {
        throw new Error("Cannot create context manager without contexts.");
      }

      _.each(options.contexts, function(context) {
        if (contexts.contains(context.name))
          throw new Error("Already registered context: " + context.name + ".");
        else {
          contexts.store(context.name, context);
          context.on("activate", self.onActivate, self);
          context.on("deactivate", self.onDeactivate, self);
        }
      });

      if (_.isArray(options.relations)) {
        _.each(options.relations, function(relation) {
          var contextName = relation.context.name;

          if (!contextName)
            throw new Error("Unknown relation: " + relation + ".");

          if (!contexts.contains(contextName))
            throw new Error("Unregistered context '" + contextName + "." );

          if (relations.contains(contextName))
            throw new Error("Relation exists for context: " + contextName + ".");
          else
            // todo: checks on relation object
            relations.store(contextName, relation); 
        });
      }

      this.options = options;
      this.contexts = contexts;
      this.relations = relations;
      this.contextsActive = {};
      this.contextsToActivate = {};
      this.contextsToDeactivate = {};
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
