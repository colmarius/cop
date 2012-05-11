$(document).ready(function() {

  module("Cop.Context");

  test("Context: creation", function() {
    var initializeFunc = function() {};
    var destroyFunc = function() {};

    var context = new Cop.Context({
      name: 'foo',
      initialize: initializeFunc,
      destroy: destroyFunc
    });

    equal(context.name, 'foo', "context name should be the same");
    equal(context.active, false, "context should not be active");
    equal(context.adaptations.length, 0, "context should have no adaptations");
    equal(context.initialize, initializeFunc, "context should have set initialize function correctly");
    equal(context.destroy, destroyFunc, "context should have set destroy function correctly");
    
    try {
      new Cop.Context();
      ok(false, "an exception should have thrown trying to create a context with no name");
    } catch (err) {
			equal(err.message, "Context object must have a name.");
		}

    try {
      new Cop.Context({});
      ok(false, "an exception should have thrown trying to create a context with empty name");
    } catch (err) {
			equal(err.message, "Context object must have a name.");
		}
  });

  test("Context: adapt", function() {
    var context = new Cop.Context({name: 'test'}),
        global  = window,
        object  = {},
        trait   = new Trait({}),
        flag    = false;

    context.on("adapt", function(adaptedObject) {
      flag = true;
      equal(adaptedObject, object, "should adapt the same object");
    });

    try {
      context.adapt(global, trait);
      ok(false, "an exception should have thrown trying to adapt an adaptation for the global object");
    } catch (err) {
			equal(err.message, "Cannot adapt the global object.");
		}
    
    try {
      context.adapt(object, trait);
			ok(true, "object adapted with trait");
    } catch (err) {
      ok(false, "should have adapted object with trait");
    }

    equal(flag, true, "flag should be true");

    try {
      context.adapt(object, Trait({}));
      ok(false, "should have thrown an exception trying to adapt the same object twice");
    } catch (err) {
      equal(err.message, "Object already adapted.");
    }
  });

  test("Context: getAdaptation", function() {
    var context = new Cop.Context({name: 'test'}),
        object = {},
        trait = new Trait({});

    context.adapt(object, trait);

    var adapted = context.getAdaptation(object);

    equal(adapted.object, object, "should be the same object");
    equal(adapted.trait, trait, "should be the same trait");
		equal(context.adaptations.length, 1, "should have 1 adapted object");
  });

  test("Context: activate deactivate", function() {
    var context = new Cop.Context({name: 'test'});
    var flag = undefined;

    context.on("activate", function() {
      flag = true;
    });
    context.on("deactivate", function() {
      flag = false;
    });

    equal(context.active, false, "context should not be active on creation");
    equal(flag, undefined, "flag should be undefined");

    context.activate();

    equal(context.active, true, "context should be active now");
    equal(flag, true, "flag should be true");

    context.activate();

    equal(context.active, true, "calling activate again on context should not change state");
    equal(flag, true, "also, flag should remain true");

    context.deactivate();
    
    equal(context.active, false, "context should be deactivated now");
    equal(flag, false, "flag should be false");

    context.deactivate();
    
    equal(context.active, false, "calling deactivate again on context should not change state");
    equal(flag, false, "flag should be false");

    context.activate();

    equal(context.active, true, "calling activate should make context active");
    equal(flag, true, "flag should be true");
  });

});
