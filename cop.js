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

    adapt: function(object, trait) {
      if (object === root) throw new Error("Cannot adapt the global object.");
      if (!_.isObject(object)) throw new Error("Only objects can be adapted.");
      if (this.getAdaptation(object)) throw new Error("Object already adapted.");
      this.adaptations.push({object: object, trait: trait});
      this.trigger("adapt", object);
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
      if (options.initialize) this.initialize = options.initialize;
      if (options.destroy)    this.destroy = options.destroy;
    }

  });

  // Cop.Composer
  // ------------
  //
  // Handles object structure modifications and knows how to compose traits.

  Cop.Composer = function() {

  };

  _.extend(Cop.Composer.prototype, {
    
    // Deletes object own properties.    
    empty: function(object) {
      _.keys(object, function(name) {
        if (_.has(object, name))
          delete object[name];
      });
    },

    // Return a shallow copy of object's own porperties.
    clone: function(object) {

    },

    // Return a new object that has the trait.
    acquire: function(object, trait) {

    },

    // No return value: 
    // object will have same properties as fromObject. 
    restore: function(object, fromObject) {
      _.extend(object, fromObject);
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
      this.contexts.registered.each(function(context) {
        log("Initializing context " + context.name + ".");
        context.initialize();
        log("Context " + context.name + " is now initialized.");
      });
      this.running = true;
      log("Context manager is running.");
      if (this.contexts.toActivate.length > 0) this.trigger("recompose", this.contexts);
      log("Context manager has started up.");
    },

    onObjectAdapted: function(object) {
      var originalObject = _.find(this.originalObjects, function(original){
        return original.object === object;
      });
      if (!originalObject) {
        this.originalObjects.push({
          object:   object,
          original: _.clone(object)
        });
        log("Adapting new object: " + object + ".");
      }
      else log("Object already adapted: " + object + ". ");
    },

    onContextChanged: function(context) {
      log("Context " + context.name + " triggered " + (context.active ? "activate" : "deactivate"));
      if (context.active) {
        this.contexts.toActivate.push(context);
        log("Context " + context.name + " marked for activation.");
      } 
      else {
        this.contexts.toDeactivate.push(context);
        log("Context " + context.name + " marked for deactivation.");
      }
      if (this.running) this.trigger("recompose", this.contexts);
      else log("Context manager not running yet. Context " + context.name + " not activated.");
    },

    recompose: function(contexts) {
      if (!this.recomposing) {
        log("Recomposition Started:");
        this.recomposing = true;
        // TODO: recomposition logic
        log("Contexts active: [" + _.pluck(contexts.active, 'name') + "], to activate: [" + _.pluck(contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(contexts.toDeactivate, 'name') + "].");
        contexts = this.resolveDependencies(contexts);
        console.log("Contexts: ", contexts);
        var adaptations = this.adaptationsToRecompose(contexts);
        this.compose(adaptations);
        console.log("Composed adaptations: ", adaptations);
        this.deploy(adaptations);
        // ...
        this.contexts.active       = _.difference(_.union(contexts.active, contexts.toActivate), contexts.toDeactivate);
        this.contexts.toActivate   = [];
        this.contexts.toDeactivate = [];
        console.log("ContextManager: ", this);
        this.recomposing = false;
        log("Recomposition Ended!");
        log("Contexts active: [" + _.pluck(contexts.active, 'name') + "], to activate: [" + _.pluck(contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(contexts.toDeactivate, 'name') + "].");
      }
      else log("ALREADY RECOMPOSING CONTEXTS.");
    },

    resolveDependencies: function(contexts) {
      log("Resolving context dependencies started:");
      contexts.toActivate = _.difference(contexts.toActivate, contexts.active, contexts.toDeactivate);
      // TODO: Look how relations impact on contexts to (de) activate.
      log("Resolving context dependencies ended!");
      return contexts;
    },

    adaptationsToRecompose: function(contexts) {
      var results = [];
      function addToResults(context, adaptation, addTraits) {
          var found = false;
          addTraits || (addTraits = false);
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
      log("2. Look into contexts.toDeactivate adapted objects, and add only the objects.");
      _.each(contexts.toDeactivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation);
        });
      });
      log("3. Look into objects in results, and for those objects add traits from active.contexts.");
      _.each(results, function(result) {
        _.each(contexts.active, function(activeContext) {
          var adaptation = activeContext.getAdaptation(result.object);
          if (adaptation) {
            result.traits.push(adaptation.trait);
            result.contexts.push(activeContext);
          }
        });
      });
      log("4. For each object in results, add clone of the original object.");
      var originalObjects = this.originalObjects;
      _.each(results, function(result) {
        var originalObject =  _.find(originalObjects, function(original) {
          return original.object === result.object;
        });
        result.originalObject = _.clone(originalObject.original);
      });
      return results;
    },

    compose: function(adaptations) {
      function checkConflicts(adaptation) {
        try{
          Trait.create({}, adaptation.composedTrait);
        }
        catch (err) {
          adaptation.hasConflicts = true;
          adaptation.errorMessage = err.message;
        }
      }
      _.each(adaptations, function(adaptation){
        adaptation.composedTrait = Trait.compose.apply(null, adaptation.traits);
        checkConflicts(adaptation);
        if (adaptation.hasConflicts)
          log("Composed trait has conflicts: " + adaptation.errorMessage);
        else
          adaptation.composedObject = Object.create(adaptation.originalObject, adaptation.composedTrait);
      });
    },

    deploy: function(adaptations) {
      var composer = this.composer;
      _.each(adaptations, function(adaptation){
        composer.empty(adaptation.object);
        composer.restore(adaptation.object, adaptation.composedObject);
      });
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
          context.on("activate",   self.onContextChanged, self);
          context.on("deactivate", self.onContextChanged, self);
          context.on("adapt",      self.onObjectAdapted,  self);
        }
      });
      // Initialize relations.
      if (_.isArray(options.relations) && options.relations.length > 0) {
        log("TODO: initialize context relations.");
      }
      this.on("recompose", this.recompose, this);
      this.options = options;
      this.relations = relations;
      this.contexts = {
        registered:   contexts,
        active:       [],
        toActivate:   [],
        toDeactivate: []
      };
      this.originalObjects = [];
      this.composer = new Cop.Composer();
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
