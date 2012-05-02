$(document).ready(function() {

  module("Cop.Context");

  test("Context: creation", function() {
    var context = new Cop.Context({name: 'foo'});

    equal(context.name, 'foo', "context name should be the same");
    equal(context.adaptations.length, 0, "context should have no adaptations");
    
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

  test("Context: setAdaptation", function() {
    var context = new Cop.Context({name: 'test'}),
        global = window,
        object = {},
        trait = new Trait({});

    try {
      context.setAdaptation(global, trait);
      ok(false, "an exception should have thrown trying to setAdaptation an adaptation for the global object");
    } catch (err) {
			equal(err.message, "Cannot adapt the global object.");
		}
    
    try {
      context.setAdaptation(object, trait);
			ok(true, "object adapted with trait");
    } catch (err) {
      ok(false, "should have adapted object with trait");
    }
  });

  test("Context: getAdaptation", function() {
    var context = new Cop.Context({name: 'test'}),
        object = {},
        trait = new Trait({});

    context.setAdaptation(object, trait);

    var adapted = context.getAdaptation(object);

    equal(adapted.object, object, "should have been the same object");
    equal(adapted.trait, trait, "should have been the same trait");
		equal(context.adaptations.length, 1, "should have 1 adapted object");
  });

});
