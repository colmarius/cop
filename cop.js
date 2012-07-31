//     Cop.js 0.2.0
//
//     (c) 2012 Marius Colacioiu
//     Cop library may be freely distributed under Apache 2.0 license.
//     For all details and documentation:
//     http://colmarius.github.com/cop/
(function() {
  
  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, 
  // `global` on the server).
  var root = this;

  // The top-level namespace. All public Cop classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Cop;
  if (typeof exports !== 'undefined')
    Cop = exports; 
  else
    Cop = root.Cop = {};

  // Current version of the library.
  Cop.VERSION = '0.2.0';

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

  // A **Context** object *reifies* the presence or absence of a *situation*
  // while an application executes. 
  var Context = Cop.Context = function(options) {
    this._configure(options || {});
  };

  // All Context objects respond to Backbone.Events methods 
  // `on`, `off` and `trigger`. In particular, `on` and `off`
  // methods can be used to subscribe and unsubscribe **callbacks** 
  // on the *activate* and *deactivate* events.
  _.extend(Context.prototype, Backbone.Events, {

    // The `initialize` method should provide logic to read some data
    // from the system and then invoke either the `activate` or 
    // `deactivate` methods on the context instance.
    // The ContextManager is created with a set of contexts and it 
    // uses the `initialize` method to perform context initialization.
    initialize: function() {},

    // Activating a Context is done by calling the `activate` method.
    activate: function() {
      if (!this.active) {
        this.active = true;
        // TODO: logical clock for activation (variable incrementer).
        this.age    = (new Date()).getTime();
        this.trigger("activate", this);
      }
    },

    // Deactivating a Context is done by calling the `deactivate` method.
    deactivate: function() {
      if (this.active) {
        this.active = false;
        this.age    = undefined;
        this.trigger("deactivate", this);
      }
    },

    // A context adaptation is declared by calling `adapt` on the Context, and 
    // by providing the `object` to be adapted and the adaptation as a `trait`.
    //
    // *Note*: **Traits** are **composable units of code reuse**. Here a single
    // trait is used as an adaptation: one which exhibits context-dependent 
    // behavior for a single object. A trait is used to group a set of methods 
    // and properties that can be acquired by an adapted object, at runtime, 
    // when the context is active.
    adapt: function(object, trait) {
      if (object === root) throw new Error("Cannot adapt the global object.");
      if (!_.isObject(object)) throw new Error("Only objects can be adapted.");
      if (this.getAdaptation(object)) throw new Error("Object already adapted.");
      this.adaptations.push({object: object, trait: trait});
      this.trigger("adapt", object);
    },

    // Returns the *adaptation* for the `object` if one was previously stored.
    getAdaptation: function(object) {
      return _.find(this.adaptations, function(adapted) {
        return adapted.object === object;
      });
    },

    // Performs the initial configuration of a Context from a set of 
    // `options`. All contexts must have a *name*.
    _configure: function(options) {      
      if (!options.name || options.name === "") throw new Error("Context object must have a name.");
      this.active      = false;
      this.adaptations = [];
      this.name        = options.name;
      if (options.initialize) this.initialize = options.initialize;
    }

  });

  // Cop.ContextManager
  // ------------------
  
  // Default context will contain default behavior for objects as traits,
  // and is always active.
  var Default = new Cop.Context({name: "Default"});
  Default.activate(); 

  // There should be *just one* ContextManager in the hole system. 
  // Upon creation should be provided with all known Context objects
  // and all possible relations.
  var ContextManager = Cop.ContextManager = function(options) {
    this._configure(options || {});
  };

  // Set up all intheritable **ContextManager** properties and methods.
  //
  // The ContextManager responds to `on`, `off` and `trigger` methods
  // inherited from Backbone.Events. Their purpose is for internal use,
  // to trigger the *start* and *end* of contexts recomposition.
  _.extend(ContextManager.prototype, Backbone.Events, {

    // Performs ContextManager initialization. 
    //
    // *Note*: Once started, the ContextManager is notified when a Context 
    // is *activated*, *deactivated* or *adapts* an object. In reaction to 
    // a Context activation / deactivation the ContextManager recomposes 
    // dynamically the behavior of adapted objects by making them acquire 
    // traits at runtime.
    start: function() {
      log("Context manager is preparing to start up.");
      var self = this;
      this.contexts.registered.each(function(context) {
        log("Initializing context '" + context.name + "'.");
        // Store original behavior for objects that already have adaptations.
        if (context.adaptations.length > 0) {
          _.each(context.adaptations, function(adaptation) {
            self._onAdapt(adaptation.object);
          }); 
        }
        context.initialize();
        log("Context '" + context.name + "' is now initialized.");
      });
      this.running = true;
      log("Context manager is now running.");
      if (this.contexts.toActivate.length > 0) this.trigger("recompose:start");
      log("Context manager has started up.");
    },

    storePolicy: function(newPolicy) {
      if (_.find(policies, function(policy) { return policy === newPolicy; })) throw new Error("Policy already registered.");
      this.policies.push(newPolicy);
    }

    // Called each time a Context *adapts* an object. Stores default 
    // behavior for an object as trait the first time the object gets adapted. 
    _onAdapt: function(object) {
      Default.adapt(object, Trait(object));
    },

    // Called each time a Context is *activated* or *deactivated*. If the 
    // ContextManager has already started it triggers a contexts recomposition
    // event.
    _onContextChange: function(context) {
      log("Context '" + context.name + "' triggered " + (context.active ? "activate, marked for activation." : "deactivate, marked for deactivation."));
      if (context.active) {
        this.contexts.toActivate.push(context);
      } 
      else {
        this.contexts.toDeactivate.push(context);
      }
      if (this.running) this.trigger("recompose:start");
      else log("Context manager not running: context '" + context.name + "' not activated yet.");
    },
  
    // Called before contexts recomposition. Delegates to Composer the task of 
    // recomposition of the current *active*, *toActivate* and *toDeactivate*
    // contexts.
    _onRecomposeStart: function() {
      var contexts = this.contexts;
      log("Contexts recomposition started:");
      log("Contexts active: [" + getName(contexts.active) + "], to activate: [" + getName(contexts.toActivate) + "], to deactivate: [" + getName(contexts.toDeactivate) + "].");
      this.composer.recompose({
        contexts:  this.contexts,
        relations: this.relations
      });
    },

    // Called after contexts recomposition has ended. Composer has finished 
    // recomposing contexts and sets the new *active* contexts on the 
    // ContextManager.
    _onRecomposeEnd: function(contexts) {
      this.contexts = contexts;
      log("Contexts recompositon ended!");
      log("Contexts active: [" + getName(contexts.active) + "], to activate: [" + getName(contexts.toActivate) + "], to deactivate: [" + getName(contexts.toDeactivate) + "].");
    },

    // Performs a first initialization of the ContextManager from a set of 
    // options. First initialize the *composer*, *contexts* and *relations*.
    _configure: function(options) {
      var composer  = new Composer({ contextManager: this });
      var contexts  = new Dictionary();
      var relations = new Dictionary();
      var policies  = [];
      var self      = this;
      // Default policy function. 
      function defaultPolicy(options) {
        // TODO: order contexts by activation age.
      }
      // Initialize contexts.
      if (!_.isArray(options.contexts) || options.contexts.length == 0) throw new Error("Cannot create context manager without contexts.");
      _.each(options.contexts, function(context) {
        if (contexts.contains(context.name)) throw new Error("Already registered context: " + context.name + ".");
        else {
          // Register each Context object.
          contexts.store(context.name, context);
          // Subscribe the ContextManager to each Context's *activate*, 
          // *deactivate* and *adapt* event.
          context.on("activate",   self._onContextChange, self);
          context.on("deactivate", self._onContextChange, self);
          context.on("adapt",      self._onAdapt,         self);
        }
      });
      // **TODO**: Initialize relations.
      if (_.isArray(options.relations) && options.relations.length > 0) {
        log("TODO: initialize context relations.");
      }
      // Subscribe to own *recompose:start* and *recompose:end* events,
      // triggered internally at context recomposition time.
      this.on("recompose:start", this._onRecomposeStart, this);
      this.on("recompose:end",   this._onRecomposeEnd,   this);
      // Set instance attributes.
      this.composer = composer;
      this.contexts = {
        registered:   contexts,
        active:       [Default],
        toActivate:   [],
        toDeactivate: []
      };
      this.options   = options;
      this.policies  = [defaultPolicy];
      this.relations = relations;
      this.resolvedTraits = new Dictionary();
    }

  });

  // Composer
  // --------
  
  // The ContextManager delegates to Composer the task of context 
  // recomposition at runtime. The Composer:
  //
  // - knows how to gather and combine adaptations affected by the 
  //   currently active contexts
  // - make's use of the `Trait` library to compose traits
  // - knows how to modify objects and how to make them acquire traits
  // 
  var Composer = function(options) {
    this._configure(options || {});
  };

  // An adaptation can access an object's original methods and properties 
  // using the following keyword.
  var superName = '_super';

  // Set up all intheritable **Composer** properties and methods.
  _.extend(Composer.prototype, {
    
    // This is the only *public method* of the Composer. The task is to 
    // compose the contexts passed in `options.contexts`. But first, 
    // possible dependencies between contexts are resolved by inspecting 
    // `options.relations`.
    recompose: function(options) {
      var adaptations;
      var conflicts;
      var contexts  = options.contexts;
      var relations = options.relations;
      contexts = this._resolveDependencies(contexts, relations);
      log("Contexts with resolved dependencies: ", contexts);
      adaptations = this._getAdaptations(contexts);
      log("Uncomposed adaptations: ", adaptations);
      this._compose(adaptations);
      log("Composed adaptations: ", adaptations);
      // Filter conflicting adaptations.
      conflicts = _.filter(adaptations, function(adaptation) {
        return adaptation.hasConflict;
      });
      if (conflicts.length > 0) {
        // Log unresolved conflicts and throw conflict errors.
        _.each(conflicts, function(conflict) {
          var contexts     = getName(conflict.contexts);
          var errorMessage = conflict.errorMessage;
          var object       = conflict.object;
          log("Contexts ", contexts, ", object: ", object, ", conflict: ", errorMessage);
          throw new Error("Contexts " + contexts + " have unresolved conflict for object: " + object + " with error message: " + errorMessage);
        });
        // Restore contexts as before recomposition.
        contexts = options.contexts;
      }
      else {          
        log("No conflicts detected.");
        // If there are no conflicts install adaptations.
        this._install(adaptations);
        // Compute new contexts.
        contexts = {
          active       : _.difference(_.union(contexts.active, contexts.toActivate), contexts.toDeactivate),
          toActivate   : [],
          toDeactivate : []
        };
      }
      // Signal that context recomposition has finished and pass *new* 
      // `contexts`.
      this.contextManager.trigger("recompose:end", contexts);
    },

    // **TODO**: How relations impact on contexts (de) activation.
    _resolveDependencies: function(contexts, relations) {
      log("TODO: resolve context dependencies.");
      contexts.active     = _.difference(contexts.active, contexts.toDeactivate);
      contexts.toActivate = _.difference(contexts.toActivate, contexts.active);
      return contexts;
    },

    // Return **all adaptations** that need to be composed by looking in the 
    // contexts that are *active*, *to activate*, or *to deactivate*.
    _getAdaptations: function(contexts) {
      var results = [];
      // Add to `results` a record with the *adapted object*. If `addTraits`
      // flag is set, add also the *context* and *trait*. 
      function addToResults(context, adaptation, addTraits) {
        addTraits || (addTraits = false);
        var found = false;
        // Check if *adaptated object* is already present in `results`.
        _.each(results, function(result) {
          if (result.object === adaptation.object) {
            found = true;
            if (addTraits) {
              // Add *trait* and *context* only if `addTraits` is set.
              result.traits.push(adaptation.trait);
              result.contexts.push(context);
            }
          }
        });
        if (!found && addTraits) 
          // If not found and `addTraits` is set, 
          // add *adapted object* with *trait* and *context*.
          results.push({
            object:   adaptation.object,
            traits:   [adaptation.trait],
            contexts: [context]
          });
        else if (!found)
          // Otherwise, add only *adapted object*.
          results.push({
            object:   adaptation.object,
            traits:   [],
            contexts: []
          });
      }
      // For each `adaptation` in `contexts.toActivate` add to `results` 
      // a record with *adapted object*, *context* and *trait*.
      _.each(contexts.toActivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation, true);
        });
      });
      // For each `adaptation` in `contexts.toDeactivate` add to `results` 
      // a record with only the *adapted object*.
      _.each(contexts.toDeactivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation);
        });
      });
      // For each `record` in `results`:
      _.each(results, function(record) {
        // First, add *trait* and *context* from `active.contexts`.
        _.each(contexts.active, function(activeContext) {
          var adaptation = activeContext.getAdaptation(record.object);
          if (adaptation) {
            record.traits.push(adaptation.trait);
            record.contexts.push(activeContext);
          }
        });
        // TODO: Add default trait and context.
        record.contexts.push(Default);
        record.traits.push(Default.getAdaptation(record.object));
      });
      return results;
    },

    // Compose all adaptations.
    _compose: function(adaptations) {
      // Store reference to ContextManager's `resolvedTraits`.
      var resolvedTraits = this.contextManager.resolvedTraits;
      // Bind `this` reference in all methods in `object` on `self`.
      function bindAllMethods(object, self) {
        _.each(object, function(property, name) {
          if (_.isFunction(property))
            object[name] = _.bind(property, self);
        });
      }
      // Mark adaptation if has conflicts, meaning some required property 
      // was not provided, or there are properties that are in conflict.
      function checkConflicts(adaptation) {
        try {
          Trait.create({}, adaptation.composedTrait);
        }
        catch (err) {
          adaptation.hasConflict  = true;
          adaptation.errorMessage = err.message;
        }
      }
      // Resolve conflict for adaptation by looking for a resolved trait
      // for the conflicting contexts.
      //
      // **TODO**: get *minimal conflicts* for the conflicting contexts 
      // (look only for those contexts in the adaptation).
      function resolve(adaptation) {
        var name    = getName(adaptation.contexts, true);
        var records = resolvedTraits.lookup(name);
        var record  = _.find(records, function(record) {
          return record.object === adaptation.object;
        });
        if (record) {
          // *Order traits* in same order as the contexts found in the 
          // resolved trait `record`.
          var orderedTraits = [];
          _.each(record.contexts, function(context) {
            var index = _.indexOf(adaptation.contexts, context);
            orderedTraits.push(adaptation.traits[index]);
          });
          // **Strategy 1**: Do we have the `getResolvedTrait` callback?
          if (record.getResolvedTrait) {
            // Call `getResolvedTrait` callback to obtain the conflict-free 
            // trait.
            //
            // **TODO**: Check if `resolvedTrait` is *really conflict free*! 
            // At least it should be.
            var resolvedTrait = record.getResolvedTrait.apply(null, orderedTraits);
            // Set resolved trait on adaptation.
            adaptation.composedTrait = resolvedTrait;
          } 
          // **Strategy 2**: No callback provided, so apply traits like mixins. 
          else {
            // Get object's *basic behavior*.
            var superObject = {};
            var composedObject = null;
            // Bind `this` in `superObject` to the *original* object reference 
            // of the adapted object.
            bindAllMethods(superObject, adaptation.object);
            // Extend basic behavior with traits applied on object 
            // from right to left order.
            _.each(orderedTraits.reverse(), function(trait) {
              var _super = {};
              _super[superName] = superObject;
              composedObject = Object.create(superObject, Trait.compose(trait, Trait(_super)));
              // Bind `this` in all methods of `superObject` on itself.
              _.each(superObject, function(property, name) {
                if (_.isFunction(property) && _.has(superObject, name))
                  superObject[name] = _.bind(property, superObject);
              });
              superObject = composedObject;
            });
            delete adaptation.composedTrait;
            // This `composedObject` has the behavior of the *adapted object* 
            // for the current set of *active contexts*.
            adaptation.composedObject = composedObject;
          }
          delete adaptation.hasConflict;
          delete adaptation.errorMessage;
        }
      }
      // For each `adaptation`:
      _.each(adaptations, function(adaptation) {
        // Compose the adaptation's `traits` into a `composedTrait`.
        adaptation.composedTrait = Trait.compose.apply(null, adaptation.traits);
        // Check adaptation for *conflicts*.
        checkConflicts(adaptation);
        // Try to *resolve* the conflict if any.
        if (adaptation.hasConflict) 
          resolve(adaptation);
        // If not resolved log the conflict, because a `resolvedTrait` 
        // record is *missing* and should have been provided.
        if (adaptation.hasConflict) {
          log("No resolved trait provided for object: ", adaptation.object, " and contexts: ", getName(adaptation.contexts));
        }
        // Is there a `composedTrait` present? 
        // If not, there is already a `composedObject` present.
        else if (adaptation.composedTrait) {
          var _super = {};
          var superObject = {};
          // Bind `this` in the `superObject` to *original* object reference 
          // for the adapted object.
          bindAllMethods(superObject, adaptation.object);
          _super[superName] = superObject;
          // Recompose trait with reference to the *original object*.
          var composedTrait = Trait.compose(adaptation.composedTrait, Trait(_super));
          // Create composed object.
          adaptation.composedObject = Object.create(superObject, composedTrait);
        }
      });
    },

    // For each adaptation, restore *adapted object* from the *composed object*.
    _install: function(adaptations) {
      function restore(object, fromObject) {
        _.each(_.keys(object), function(key) { delete object[key]; });
        _.extend(object, fromObject);
      }
      _.each(adaptations, function(adaptation) {
        restore(adaptation.object, adaptation.composedObject);
      });
    },

    // First initialization of the Composer.
    _configure: function(options) {
      if (!options.contextManager) throw new Error("Cannot create composer without a context manager.");
      this.contextManager = options.contextManager;
    }

  });

	// Dictionary
	// ----------
	
	// Simple dictionary for storing name-value pairs, for internal use only.
  function Dictionary(startValues) {
    this.values = _.clone(startValues) || {};
  }

  // Set up all intheritable **Dictionary** properties and methods.
  _.extend(Dictionary.prototype, {

  	// Store `name` and `value` pair.
    store: function(name, value) {
      this.values[name] = value;
    },
    
    // Lookup value for `name`.
    lookup: function(name) {
      return this.values[name];
    },
    
    // Check if `name` was already stored in dictionary.
    contains: function(name) {
      return Object.prototype.hasOwnProperty.call(this.values, name) &&
        Object.prototype.propertyIsEnumerable.call(this.values, name);
    },

		// Invoke the `action` function on each dictionary name-value pair.    
    each: function(action) {
      _.each(this.values, action);
    }

  });

  // Helpers
  // -------

  // Returns a string composed from the names of the `contexts`. 
  // Optionally ordered, if `ordered` flag is set.
  function getName(contexts, ordered) {
    var result = _.pluck(contexts, 'name');
    if (ordered) result.sort();
    return result.join(",");
  }
  
  // Keep history for sanity reasons.
  var history = ContextManager.history = []; 

  // Logged messages go into history.
  var log = function() { history.push(_.toArray(arguments)); };

  // You can inspect the history of logged messages in the console by calling:
  //
  //		Cop.ContextManager.showHistory();
  //
  ContextManager.showHistory = function() { 
    _.each(history, function(lineArray) { 
      console.log(lineArray); 
    });
  };

}).call(this);
