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
      if (options.destroy)    this.destroy    = options.destroy;
    }

  });

  // Cop.ContextManager
  // ------------------
  
  Cop.ContextManager = function(options) {
    this._configure(options || {});
  };

  _.extend(Cop.ContextManager.prototype, Backbone.Events, {

    start: function() {
      log("Context manager is preparing to start up.");
      this.contexts.registered.each(function(context) {
        log("Initializing context " + context.name + ".");
        context.initialize();
        log("Context " + context.name + " is now initialized.");
      });
      this.running = true;
      log("Context manager is running.");
      if (this.contexts.toActivate.length > 0) this.trigger("recompose:start");
      log("Context manager has started up.");
    },

    _onObjectAdapt: function(object) {
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

    _onContextChange: function(context) {
      log("Context " + context.name + " triggered " + (context.active ? "activate" : "deactivate"));
      if (context.active) {
        this.contexts.toActivate.push(context);
        log("Context " + context.name + " marked for activation.");
      } 
      else {
        this.contexts.toDeactivate.push(context);
        log("Context " + context.name + " marked for deactivation.");
      }
      if (this.running) this.trigger("recompose:start");
      else log("Context manager not running: context '" + context.name + "' not activated yet.");
    },

    _onRecomposeStart: function() {
      log("Context recomposition started:");
      log("Contexts active: [" + _.pluck(this.contexts.active, 'name') + "], to activate: [" + _.pluck(this.contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(this.contexts.toDeactivate, 'name') + "].");
      this.composer.recompose({
        contexts:  this.contexts,
        relations: this.relations
      });
    },

    _onRecomposeEnd: function(contexts) {
      this.contexts = contexts;
      log("Context recompositon ended!");
      log("Contexts active: [" + _.pluck(contexts.active, 'name') + "], to activate: [" + _.pluck(contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(contexts.toDeactivate, 'name') + "].");
    },

    _configure: function(options) {
      var self = this;
      var contexts  = new Dictionary();
      var relations = new Dictionary();
      var composer  = new Cop.Composer({contextManager: this});
      // Initialize contexts.
      if (!_.isArray(options.contexts) || options.contexts.length == 0) throw new Error("Cannot create context manager without contexts.");
      _.each(options.contexts, function(context) {
        if (contexts.contains(context.name)) throw new Error("Already registered context: " + context.name + ".");
        else {
          contexts.store(context.name, context);
          context.on("activate",   self._onContextChange, self);
          context.on("deactivate", self._onContextChange, self);
          context.on("adapt",      self._onObjectAdapt,   self);
        }
      });
      // Initialize relations.
      if (_.isArray(options.relations) && options.relations.length > 0) {
        log("TODO: initialize context relations.");
      }
      // Context manager handles context recomposition.
      this.on("recompose:start", this._onRecomposeStart, this);
      this.on("recompose:end",   this._onRecomposeEnd,   this);
      // Context manager attributes.
      this.options = options;
      this.contexts = {
        registered:   contexts,
        active:       [],
        toActivate:   [],
        toDeactivate: []
      };
      this.relations = relations;
      this.composer = composer;
      this.originalObjects = [];
    }

  });

  // Cop.Composer
  // ------------
  //
  // The context manager delegates the composer to combine adaptations 
  // for the currently active contexts.
  // Composer knows how to apply object structure modifications. 
  // He knows how to compose traits and how to make objects acquire them.

  Cop.Composer = function(options) {
    this._configure(options || {});
  };

  _.extend(Cop.Composer.prototype, {
    
    recompose: function(options) {
      var contexts    = options.contexts;
      var relations   = options.relations;
      var adaptations;
      var conflicts;
      if (!this.recomposing) {
        this.recomposing = true;
        contexts = this.resolveDependencies(contexts, relations);
        console.log("Contexts with resolved dependencies: ", contexts);
        adaptations = this.getAdaptations(contexts);
        this.compose(adaptations);
        console.log("Composed adaptations: ", adaptations);
        conflicts = _.filter(adaptations, function(adaptation) {
          return adaptation.hasConflict;
        });
        if (conflicts.length > 0) {
          log("Conflicts detected!");
          console.log("Conflicts detected: ", conflicts);
          _.each(conflicts, function(adaptation) {
            console.log("Conflicting adaptations: ", adaptation);
          });
        }
        else {          
          log("No conflicts detected.");
          this.install(adaptations);
          contexts = {
            active       : _.difference(_.union(contexts.active, contexts.toActivate), contexts.toDeactivate),
            toActivate   : [],
            toDeactivate : []
          };
          console.log("ContextManager: ", this.contextManager);
          console.log("Recomposed contexts: ", contexts);
          this.contextManager.trigger("recompose:end", contexts);
        }
        this.recomposing = false;
      }
      else log("ALREADY RECOMPOSING CONTEXTS.");
    },

    resolveDependencies: function(contexts, relations) {
      log("Resolving context dependencies started:");
      contexts.toActivate = _.difference(contexts.toActivate, contexts.active, contexts.toDeactivate);
      // TODO: Look how relations impact on contexts to (de) activate.
      log("Resolving context dependencies ended!");
      return contexts;
    },

    getAdaptations: function(contexts) {
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
      log("Computing adaptations to compose started:");
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
      log("3. Look into objects in results, and add traits from active.contexts and a clone of the original (unadapted) object.");
      var originalObjects = this.contextManager.originalObjects;
      _.each(results, function(result) {
        // First, add to result record the traits from active.contexts if any.
        _.each(contexts.active, function(activeContext) {
          var adaptation = activeContext.getAdaptation(result.object);
          if (adaptation) {
            result.traits.push(adaptation.trait);
            result.contexts.push(activeContext);
          }
        });
        // Second, add to result record a clone of the original object behavior.
        var originalObject = _.find(originalObjects, function(original) {
          return original.object === result.object;
        });
        result.originalObject = _.clone(originalObject.original);
      });
      log("Computing adaptations to compose ended!");
      return results;
    },

    compose: function(adaptations) {
      function checkConflicts(adaptation) {
        try{
          Trait.create({}, adaptation.composedTrait);
        }
        catch (err) {
          adaptation.hasConflict  = true;
          adaptation.errorMessage = err.message;
        }
      }
      log("Composing adaptations started:");
      _.each(adaptations, function(adaptation){
        adaptation.composedTrait = Trait.compose.apply(null, adaptation.traits);
        checkConflicts(adaptation);
        if (adaptation.hasConflict)
          log("Detected conflict on composed trait: " + adaptation.errorMessage);
        else
          adaptation.composedObject = Object.create(adaptation.originalObject, adaptation.composedTrait);
      });
      log("Composing adaptations ended!");
    },

    install: function(adaptations) {
      function empty(object) {
        _.keys(object, function(name) { 
          if (_.has(object, name)) delete object[name];
        });
      }
      function restore(object, fromObject) {
        empty(object);
        _.extend(object, fromObject);
      }
      var self = this;
      _.each(adaptations, function(adaptation) {
        restore(adaptation.object, adaptation.composedObject);
      });
    },

    _configure: function(options) {
      if (!options.contextManager) throw new Error("Cannot create composer without a context manager.");
      this.contextManager = options.contextManager;
    }

  });

  // Helpers
  // -------

  // For debug reasons.
  var history = Cop.ContextManager.history = []; 

  var log = function(line) { history.push(line); };

  root.showHistory = function() { console.log(history.join("\n")); };

  // Dictionary for storing key-value pairs.
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
