var mustTrace   = true;
var mustProfile = true;

MYAPP = {
  initScreen: function() { var i=0; while (i < 1000000) i++; },
  init: function() { this.initScreen(); },
  run:  function() { this.init(); }
};

var tracer = new Cop.Context({
  name: 'tracer',
  initialize: function() {
    if (mustTrace == true) this.activate();
  }
});

var profiler = new Cop.Context({
  name: 'profiler',
  initialize: function() {
    if (mustProfile == true) this.activate();
  }
});

tracer.trace = function(options) {
  var adapted = {};
  options.methods || (options.methods = getMethods(options.object));
  forEach(options.methods, function(method) {
    adapted[method] = function() {
      var start = new Date().getMilliseconds();
      var result = this._super[method].apply(this._super, arguments);
      var time = new Date().getMilliseconds() - start;
      print(options.name + "." + method + " took " + (time/1000) + " seconds to run.");
      return result;
    };
  });
  this.adapt(options.object, Trait(adapted));
};

profiler.profile = function(options) {
  var adapted = {};
  var ident = '';
  options.methods || (options.methods = getMethods(options.object));
  forEach(options.methods, function(method) {
    adapted[method] = function() {
      ident += '  ';
      print("Entering: " + ident + options.name + "." + method);
      var result = this._super[method].apply(this._super, arguments);
      print("Exiting:  " + ident + options.name + "." + method);
      ident = ident.slice(0, ident.length - 2);
      return result;
    };
  });
  this.adapt(options.object, Trait(adapted));
};

tracer.trace({object: MYAPP, name: 'MYAPP'});

profiler.profile({object: MYAPP, name: 'MYAPP'});

var cm = new Cop.ContextManager({
  contexts: [tracer, profiler],
  relations: {}
});

// cm.resolveConflict(MYAPP, [profiler, tracer]);

cm.resolveConflict(MYAPP, [tracer, profiler], function(tracerT, profilerT) {
  return Trait.compose(
    Trait.resolve({
      run: 'runTracer', 
      init: 'initTracer',
      initScreen: 'initScreenTracer'
    }, tracerT),
    Trait.resolve({
      run: 'runProfiler',
      init: 'initProfiler',
      initScreen: 'initScreenProfiler'
    }, profilerT),
    Trait({
      run: function() {
        this.runProfiler();
      },
      init: function() {
        this.initTracer();
      },
      initScreen: function() {
        this.initScreenTracer();
      }
    }));
});

cm.start(); // now contexts are initialized and objects are composed accordingly

MYAPP.run();

// Helper functions.
function getMethods(object) {
  var methods = [];
  forEachIn(object, function(name, value) { methods.push(name); });
  return methods;
}
function forEach(array, action) {
  for (var i = 0; i < array.length; i++)
    action(array[i]);
}
function forEachIn(object, action) {
  for (var property in object) {
    if (object.hasOwnProperty(property))
      action(property, object[property]);
  }
}