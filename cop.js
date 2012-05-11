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
  
  Cop.Context = function(options) {
    this._configure(options || {});
  };

  _.extend(Cop.Context.prototype, Backbone.Events, {

    initialize: function() {},

    destroy: function() {},

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
      if (object === root) throw new Error("Cannot adapt the global object.");
      if (!_.isObject(object)) throw new Error("Only objects can be adapted.");
      if (this.getAdaptation(object)) throw new Error("Object already adapted");
      this.adaptations.push({object: object, trait: trait});
      this.trigger("setAdaptation", object);
    },

    getAdaptation: function(object) {
      return _.find(this.adaptations, function(adaptation) {
        return adaptation.object === object;
      });
    },

    _configure: function(options) {      
      if (!options.name || options.name === "") throw new Error("Context object must have a name.");
      this.name = options.name;
      this.active = false;
      this.adaptations = [];
      if (_.isFunction(options.initialize)) this.initialize = options.initialize;
      if (_.isFunction(options.destroy))    this.destroy = options.destroy;
    }

  });

  // Cop.Composer
  // ------------
  //
  // Handles object structure modifications and knows how to compose traits.

  Cop.Composer = function() {

  };

  _.extend(Cop.Composer.prototype, {
    
    // Return a shallow copy of object's own porperties.
    clone: function(object) {

    },

    // Return a new object that has the trait.
    acquire: function(object, trait) {

    },

    // No return value: 
    // object will have same properties as fromObject. 
    restore: function(object, fromObject) {

    }

  });

  // Cop.ContextManager
  // ------------------
  
  Cop.ContextManager = function(options) {
    this._configure(options || {});
    this.initialize.apply(this, arguments);
  };

  var history = Cop.ContextManager.history = []; 

  _.extend(Cop.ContextManager.prototype, Backbone.Events, {

    initialize: function() {},

    start: function() {
      log("Context manager is preparing to start up.");
      this.contexts.each(function(context) {
        log("Initializing context " + context.name + ".");
        context.initialize();
        log("Context " + context.name + " is now initialized.");
      });
      this.running = true;
      log("Context manager is running.");
      if (this.contextsToActivate.length > 0) this.trigger("recompose");
      log("Context manager has started up.");
    },

    onObjectAdapted: function(object) {
      var adaptedObject = _.find(this.adaptedObjects, function(adapted){
        return adapted.object === object;
      });
      if (!adaptedObject) {
        this.adaptedObjects.push({
          object: object,
          clone: _.clone(object)
        });
        log("Adapting new object: " + object + ".");
      }
      else log("Object already adapted: " + object + ".");
    },

    onContextChanged: function(context) {
      log("Context " + context.name + " triggered " + (context.active ? "activate" : "deactivate"));
      if (context.active) {
        this.contextsToActivate.push(context);
        log("Context " + context.name + " marked for activation.");
      } 
      else {
        this.contextsToDeactivate.push(context);
        log("Context " + context.name + " marked for deactivation.");
      }
      if (this.running) this.trigger("recompose");
      else log("Context manager not running yet. Context " + context.name + " not activated.");
    },

    recompose: function() {
      if (!this.recomposing) {
        log("Recomposition Started:");
        this.recomposing = true;
        var contexts = {
          active: this.contextsActive,
          toActivate: this.contextsToActivate,
          toDeactivate: this.contextsToDeactivate
        };

        // TODO: recomposition logic
        console.log("Contexts: ", contexts);
        contexts = this.resolveDependencies(contexts);
        var objects = this.objectsToRecompose(contexts);
        // ...

        this.contextsActive       = _.difference(_.union(contexts.active, contexts.toActivate), contexts.toDeactivate);
        this.contextsToActivate   = [];
        this.contextsToDeactivate = [];
        console.log("ContextManager: ", this);
        this.recomposing = false;
        log("Recomposition Ended!");
      }
      else log("ALREADY RECOMPOSING CONTEXTS.");
    },

    resolveDependencies: function(contexts) {
      // 1. Look how relations impact on contexts to (de) activate.
      // 2. contexts.toActivate = contexts.toActivate - contexts.active 
      //      - contexts.toDeactivate
      // 3. contexts.toDeactivate = contexts.toDeactivate
      return contexts;
    },

    objectsToRecompose: function(contexts) {
      var results = [];
      function addToResults(context, adaptation, addTraits) {
          var found = false;
          addTraits = addTraits || false;
          _.each(results, function(result) {
            if (result.object == adaptation.object) {
              found = true;
              if (addTraits) {
                result.traits.push(adaptation.trait);
                result.contexts.push(context);
              }
            }
          });
          if (!found && addTraits) 
            results.push({
              object:   adaptation.object,
              traits:   [adaptation.trait],
              contexts: [context]
            });
          else if (!found)
            results.push({
              object:   adaptation.object,
              traits:   [],
              contexts: []
            });
      }
      log("1. Look into contexts.toActivate adapted objects, and add those objects with traits.");
      _.each(contexts.toActivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation, true);
        });
      });
      console.log("results (1): ", results);
      log("2. Look into contexts.toDeactivate adapted objects, and add only the objects.");
      _.each(contexts.toDeactivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation);
        });
      });
      console.log("results (2): ", results);
      log("3. Look into objects in results, and for those objects add active.contexts traits.");
      _.each(results, function(result) {
        _.each(contexts.active, function(activeContext) {
          var adaptation = activeContext.getAdaptation(result.object);
          if (adaptation) {
            result.traits.push(adaptation.trait);
            result.contexts.push(activeContext);
          }
        });
      });
      console.log("results (3): ", results);
      return results;
    },

    _configure: function(options) {
      var self = this;
      var contexts = new Dictionary();
      var relations = new Dictionary();
      // Initialize contexts.
      if (!_.isArray(options.contexts)) throw new Error("Cannot create context manager without contexts.");
      _.each(options.contexts, function(context) {
        if (contexts.contains(context.name)) throw new Error("Already registered context: " + context.name + ".");
        else {
          contexts.store(context.name, context);
          context.on("activate", self.onContextChanged, self);
          context.on("deactivate", self.onContextChanged, self);
          context.on("setAdaptation", self.onObjectAdapted, self);
        }
      });
      // Initialize relations.
      if (_.isArray(options.relations) && options.relations.length > 0) {
        log("TODO: initialize context relations.");
      }
      this.on("recompose", this.recompose, this);
      this.options = options;
      this.contexts = contexts;
      this.relations = relations;
      this.contextsActive = [];
      this.contextsToActivate = [];
      this.contextsToDeactivate = [];
      this.adaptedObjects = [];
    }

  });

  // Helpers
  // -------

  var log = function(line) { history.push(line); };

  // For debug reasons.
  root.showHistory = function() { console.log(history.join("\n")); };

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
