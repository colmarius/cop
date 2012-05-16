//     Cop.js 0.0.3
//
//     (c) 2012 Marius Colacioiu
//     Cop library may be freely distributed under Apache 2.0 license.
//     For all details and documentation:
//     (url)
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

  // A Context object reifies the presence or absence of a situation
  // while an application executes. 
  // Follows real world example that uses the Phonegap API to reify as
  // a context the *low battery* situation on a mobile device.
  //
  //		var batteryLow = new Cop.Context({
  //			name: 'batteryLow',
  //			initialize: function() {
  //				window.addEventListener("batterylow", onBatteryLow, false);
  //				function onBatteryLow(info) {
  //					if (info.level <= 30) this.activate();
  //					else this.deactivate();
  //				}
  //			}
  //		});
  //
  var Context = Cop.Context = function(options) {
    this._configure(options || {});
  };

  // All Context objects respond to Backbone.Events methods 
  // `on`, `off` and `trigger`. In particular, `on` and `off`
  // methods can be used to subscribe and unsubscribe **callbacks** 
  // on the *activate* and *deactivate* events.
  //
  //		batteryLow.on('activate', function() {
  //			alert("battery is now low");
  //		});
  //
  //		batteryLow.on('deactivate', function() {
  //			alert("battery is back to normal");
  //		});
  //
  _.extend(Cop.Context.prototype, Backbone.Events, {

  	// The `initialize` method should provide logic to read some data
  	// from the system and then invoke either the `activate` or 
  	// `deactivate` methods on the context instance.
  	// The ContextManager is created with a set of contexts and it 
  	// uses the `initialize` method to perform context initialization.
    initialize: function() {},

    // FUTURE: has no role for now.
    destroy: function() {},

    // Activating a Context is done by calling the `activate` method:
    //
    //		batteryLow.activate(); 
    // 		
    activate: function() {
      if (!this.active) {
        this.active = true;
        this.trigger("activate", this);
      }
    },

    // Analogously, deactivating a Context is done by calling the 
    // `deactivate` method:
    //
    //		batteryLow.deactivate(); 
    // 	
    deactivate: function() {
      if (this.active) {
        this.active = false;
        this.trigger("deactivate", this);
      }
    },

    // Adaptation to context is declared by calling `adapt` on the 
    // Context, and by providing the `object` to be adapted and 
    // the adaptation as a `trait`.
    //
    //		MyApp = {
    //			initScreen: function() {
    //				alert("Normal initialization."); 
    //			}
    //		};
    //
    //		batteryLow.adapt(MyApp, Trait({
    //			initScreen: function() { 
    //				// this._super.initScreen();
    //				alert("Low battery initialization."); 
    //			}
    //		}));
    //		
    adapt: function(object, trait) {
      if (object === root) throw new Error("Cannot adapt the global object.");
      if (!_.isObject(object)) throw new Error("Only objects can be adapted.");
      if (this.getAdaptation(object)) throw new Error("Object already adapted.");
      this.adaptations.push({object: object, trait: trait});
      this.trigger("adapt", object);
    },

    // Returns the context-dependent *adaptation* for the `object` 
    // if one was previously stored.
    getAdaptation: function(object) {
      return _.find(this.adaptations, function(adaptation) {
        return adaptation.object === object;
      });
    },

    // Performs the initial configuration of a Context from a set of 
    // `options`. All contexts have a *name*, an *active* state, a set 
    // of *adaptations*, and optionally an *initialize* and a *destroy* 
    // function.
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
  
  // There should be one ContextManager in the hole system. 
  // Upon creation should be provided with all known Context objects
  // and all possible relations between them.
  //
  //		var batteryLow = new Cop.Context({name: 'batteryLow'});
  //		var offline    = new Cop.Context({name: 'offline'});
  //		
  //		var contextManager = new Cop.ContextManager({
  //			contexts: [batteryLow, offline],
  //			relations: {}
  //		});
  //
  var ContextManager = Cop.ContextManager = function(options) {
    this._configure(options || {});
  };

  // The ContextManager responds to `on`, `off` and `trigger` methods
  // inherited from Backbone.Events. Their purpose is for internal use,
  // to trigger the start and end of contexts recomposition.
  _.extend(ContextManager.prototype, Backbone.Events, {

  	// Performs ContextManager initialization. From this moment on
  	// activating and deactivating a Context will change adapted
  	// objects, making them acquire traits (context-dependent behavior).
    start: function() {
      log("Context manager is preparing to start up.");
      this.contexts.registered.each(function(context) {
        log("Initializing context '" + context.name + "'.");
        context.initialize();
        log("Context '" + context.name + "' is now initialized.");
      });
      this.running = true;
      log("Context manager is running.");
      if (this.contexts.toActivate.length > 0) this.trigger("recompose:start");
      log("Context manager has started up.");
    },

    // Objects can have different traits for different contexts.
    // These traits may easilly conflict if they provide the same
    // property name. A mechanism for resolving conflicts between
    // traits may be easily provided.
    // 
    // Recall the `MYAPP` object:
    //
    //		MyApp = {
    //			initScreen: function() {
    //				alert("Normal initialization."); 
    //			}
    //		};
    //
    // Let's supose that the contexts `batteryLow` and `offline`
    // have two adaptations for the `MYAPP` object for the same method:
    //
    //
    //		batteryLow.adapt(MyApp, Trait({
    //			initScreen: function() { 
    //				// this._super.initScreen();
    //				alert("Low battery initialization."); 
    //			}
    //		}));
    //		
    //		offline.adapt(MyApp, Trait({
    //			initScreen: function() { 
    //				// this._super.initScreen();
    //				alert("Low battery initialization."); 
    //			}
    //		}));
    //		
    // Resolving the conflict generated when the two contexts will
    // be active requires using the `resolveConflict` funcitonality
    // on the ContextManager:
    //
		//		contextManager.resolveConflict(MYAPP, [batteryLow, offline], 
		//			function(batteryLowT, offlineT) {
		//				return Trait.compose(
		//					Trait.resolve({initScreen: 'initScreenBatteryLow'}, 
		//												batteryLowT), 
		//					Trait.resolve({initScreen: 'initScreenOffline'}, 
		//												offlineT),
		//					Trait({
		//						initScreen: function() {
		//							alert("Running offline with low battery.");
		//							this.initScreenBatteryLow();
		//							this.initScreenOffline();
		//						}
		//					})
		//				);
		//			});
		//
    resolveConflict: function(object, contexts, getResolvedTrait) {
      var name = getCombinedName(contexts);
      var records = this.resolvedTraits.lookup(name);
      if (!records) {
        records = [];
        this.resolvedTraits.store(name, records);
      }
      var record = _.find(records, function(record) {
        return record.object === object;
      });
      if (record) throw new Error("Object already has resolved trait for contexts: " + name + ".");
      else
        records.push({
          object:   object,
          contexts: contexts,
          getResolvedTrait: getResolvedTrait
        });
    },

    // Called each time a Context adapts an object. Stores a clone
    // of the object the first time it gets adapted. 
    _onAdapt: function(object) {
      var originalObject = _.find(this.originalObjects, function(original) {
        return original.object === object;
      });
      if (!originalObject) {
        this.originalObjects.push({
          object:   object,
          original: _.clone(object)
        });
        log("Adapting new object: ", object, ".");
      }
      else log("Object already adapted: ", object, ". ");
    },

    // Called each time a Context gets activated or deactivated.
    // If the ContextManager has already started it triggers an event 
    // that starts contexts recomposition.
    _onContextChange: function(context) {
      log("Context '" + context.name + "' triggered " + (context.active ? "activate" : "deactivate"));
      if (context.active) {
        this.contexts.toActivate.push(context);
        log("Context '" + context.name + "' marked for activation.");
      } 
      else {
        this.contexts.toDeactivate.push(context);
        log("Context '" + context.name + "' marked for deactivation.");
      }
      if (this.running) this.trigger("recompose:start");
      else log("Context manager not running: context '" + context.name + "' not activated yet.");
    },

    // Called on contexts recomposition start event. 
    // Delegates to Composer the recomposition for the current
    // *active*, *toActivate* and *toDeactivate* contexts.
    _onRecomposeStart: function() {
      log("Context recomposition started:");
      log("Contexts active: [" + _.pluck(this.contexts.active, 'name') + "], to activate: [" + _.pluck(this.contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(this.contexts.toDeactivate, 'name') + "].");
      this.composer.recompose({
        contexts:  this.contexts,
        relations: this.relations
      });
    },

    // Composer has finished recomposing contexts and it notifies the
    // ContextManager with the new *active* contexts.
    _onRecomposeEnd: function(contexts) {
      this.contexts = contexts;
      log("Context recompositon ended!");
      log("Contexts active: [" + _.pluck(contexts.active, 'name') + "], to activate: [" + _.pluck(contexts.toActivate, 'name') + "], to deactivate: [" + _.pluck(contexts.toDeactivate, 'name') + "].");
    },

    // Performs a first initialization of the ContextManager from 
    // a set of options with *contexts* and *relations*.
    _configure: function(options) {
      var self = this;
      var contexts  = new Dictionary();
      var relations = new Dictionary();
      var composer  = new Composer({contextManager: this});
      // Initialize contexts.
      if (!_.isArray(options.contexts) || options.contexts.length == 0) throw new Error("Cannot create context manager without contexts.");
      _.each(options.contexts, function(context) {
        if (contexts.contains(context.name)) throw new Error("Already registered context: " + context.name + ".");
        else {
        	// Register the Context.
          contexts.store(context.name, context);
          // Subscribe to each Context's *activate*, *deactivate* 
          // and *adapt* events.
          context.on("activate",   self._onContextChange, self);
          context.on("deactivate", self._onContextChange, self);
          context.on("adapt",      self._onAdapt,         self);
        }
      });
      // Initialize relations.
      if (_.isArray(options.relations) && options.relations.length > 0) {
        log("TODO: initialize context relations.");
      }
      // Subscribe to own *recompose:start* and *recompose:end* events.
      this.on("recompose:start", this._onRecomposeStart, this);
      this.on("recompose:end",   this._onRecomposeEnd,   this);
      // Set instance attributes.
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
      this.resolvedTraits = new Dictionary();
    }

  });

  // Composer
  // --------
  
  // The ContextManager delegates the Composer to do context 
  // recomposition at runtime. The Composer:
  //
  // - knows how to gather and combine adaptations affected by the 
  //   currently active contexts
  // - make's use of the `Trait` library to compose traits
  // - knows how to modify objects and how to make them acquire traits
  var Composer = function(options) {
    this._configure(options || {});
  };

  // An adaptation can access an original object's properties using the 
  // following keyword.
  var superName = '_super';

  // Set up all intheritable **Composer** properties and methods.
  _.extend(Composer.prototype, {
    
    recompose: function(options) {
      var contexts  = options.contexts;
      var relations = options.relations;
      var adaptations;
      var conflicts;
      if (!this.recomposing) {
        this.recomposing = true;
        contexts = this._resolveDependencies(contexts, relations);
        log("Contexts with resolved dependencies: ", contexts);
        adaptations = this._getAdaptations(contexts);
        log("Uncomposed adaptations: ", adaptations);
        this._compose(adaptations);
        log("Composed adaptations: ", adaptations);
        conflicts = _.filter(adaptations, function(adaptation) {
          return adaptation.hasConflict;
        });
        if (conflicts.length > 0) {
          // Unresolved conflicts remain.
          log("Unresolved conflicts: ", conflicts);
          _.each(conflicts, function(conflict) {
            log("Contexts ", _.pluck(conflict.contexts, 'name').join(","), " have unresolved conflict for object: ", conflict.object);
          });
          // Restore contexts before reolving dependencies.
          contexts = options.contexts;
        }
        else {          
          log("No conflicts detected.");
          this._install(adaptations);
          // Compute new contexts.
          contexts = {
            active       : _.difference(_.union(contexts.active, contexts.toActivate), contexts.toDeactivate),
            toActivate   : [],
            toDeactivate : []
          };
        }
        this.contextManager.trigger("recompose:end", contexts);
        this.recomposing = false;
      }
      else log("ALREADY RECOMPOSING CONTEXTS.");
    },

    // TODO: Look how relations impact on contexts to (de) activate.
    _resolveDependencies: function(contexts, relations) {
      log("Resolving context dependencies started:");
      contexts.toActivate = _.difference(contexts.toActivate, contexts.active, contexts.toDeactivate);
      contexts.active = _.difference(contexts.active, contexts.toDeactivate);
      log("Resolving context dependencies ended!");
      return contexts;
    },

    _getAdaptations: function(contexts) {
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
      log("Adaptations search started:");
      log("1. For each object in 'contexts.toActivate' add object with traits.");
      _.each(contexts.toActivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation, true);
        });
      });
      log("2. For each object in 'contexts.toDeactivate' add object only.");
      _.each(contexts.toDeactivate, function(context) {
        _.each(context.adaptations, function(adaptation) {
          addToResults(context, adaptation);
        });
      });
      log("3. For each object in results add traits from 'active.contexts' and a clone of the original object from 'adaptedObjects'.");
      var originalObjects = this.contextManager.originalObjects;
      _.each(results, function(result) {
        // First, add to `result` the traits from `active.contexts`.
        _.each(contexts.active, function(activeContext) {
          var adaptation = activeContext.getAdaptation(result.object);
          if (adaptation) {
            result.traits.push(adaptation.trait);
            result.contexts.push(activeContext);
          }
        });
        // Second, add to `result` a clone of the original object.
        var originalObject = _.find(originalObjects, function(original) {
          return original.object === result.object;
        });
        result.originalObject = _.clone(originalObject.original);
      });
      log("Adaptations search ended!");
      return results;
    },

    _compose: function(adaptations) {
    	var resolvedTraits = this.contextManager.resolvedTraits;
      function checkConflicts(adaptation) {
        try {
          Trait.create({}, adaptation.composedTrait);
        }
        catch (err) {
          log("Adaptation has conflicts: ", adaptation);
          adaptation.hasConflict  = true;
          adaptation.errorMessage = err.message;
        }
      }
      function resolve(adaptation) {
        var name = getCombinedName(adaptation.contexts);
        var records = resolvedTraits.lookup(name);
        var record = _.find(records, function(record) {
          return record.object === adaptation.object;
        });
        if (record) {
          log("Resolving adaptation: ", adaptation, " with record: ", record);
          var orderedTraits = [];
          _.each(record.contexts, function(context) {
            // TODO order traits
          });

          var resolvedTrait = record.getResolvedTrait.apply(null, adaptation.traits);
          adaptation.composedTrait = resolvedTrait;
          delete adaptation.hasConflict;
          delete adaptation.errorMessage;
          adaptation.resolved = true;
        }
        else log("No resolved trait found for adaptation: ", adaptation);
      }
      log("Adaptations composition started:");
      _.each(adaptations, function(adaptation) {
        adaptation.composedTrait = Trait.compose.apply(null, adaptation.traits);
        checkConflicts(adaptation);
        if (adaptation.hasConflict) 
          resolve(adaptation);
        if (adaptation.hasConflict && !adaptation.resolved) {
          log("No resolved trait provided for object: ", adaptation.object, " and contexts: ", adaptation.contexts);
        } 
        else {
        	var refToSuper = {};
        	refToSuper[superName] = adaptation.originalObject;
          var composedTrait = Trait.compose(adaptation.composedTrait, Trait(refToSuper));
          adaptation.composedObject = Object.create(adaptation.originalObject, composedTrait);
        }
      });
      log("Adaptations composition ended!");
    },

    // At this point adaptations contain a reference to the `object`
    // and one to the `composedObject`. The first references the 
    // original object, the second references an object that has the
    // new behavior for the original object. For each adaptation the 
    // `composedObject` methods will replace those of the adapted 
    // `object`, keeping intact it's reference.
    _install: function(adaptations) {
      function restore(object, fromObject) {
        _.each(_.keys(object), function(key) { delete object[key]; });
        _.extend(object, fromObject);
      }
      _.each(adaptations, function(adaptation) {
        restore(adaptation.object, adaptation.composedObject);
      });
    },

    _configure: function(options) {
      if (!options.contextManager) throw new Error("Cannot create composer without a context manager.");
      this.contextManager = options.contextManager;
    }

  });

	// Dictionary
	// ----------
	
	// Simple dictionary for storing name-value pairs.
	// Internal library use only.
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

		// Invoke `action` function on each dictionary name-value pair.    
    each: function(action) {
      _.each(this.values, action);
    }

  });

  // Helpers
  // -------

  // Returns a string composed from the `contexts` array that can be 
  // used as a unique key in a dictionary.
  function getCombinedName(contexts) {
    return _.pluck(contexts, 'name').sort().join(",");
  };
  
  // Keep history for sanity reasons.
  var history = ContextManager.history = []; 

  // Log messages go to history.
  var log = function() { history.push(_.toArray(arguments)); };

  ContextManager.showHistory = function() { 
    _.each(history, function(lineArray) { 
      //lineArray = lineArray.join(" ");
      console.log(lineArray); 
    });
  };

}).call(this);
