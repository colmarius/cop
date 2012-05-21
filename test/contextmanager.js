$(document).ready(function() {

  module("Cop.ContextManager", {
    setup: function() {
      this.a = new Cop.Context({name: 'a'});
      this.b = new Cop.Context({name: 'b'});
      this.c = new Cop.Context({name: 'c'});
    },
    teardown: function() {
      delete this.a;
      delete this.b;
      delete this.c;
    }
  });

  test("ContextManager: creation with contexts", function() {
    var cm = new Cop.ContextManager({
      contexts: [this.a, this.b, this.c],
      relations: []
    });

		ok(cm.contexts, "should have contexts container");
    ok(cm.contexts.registered, "should have registered contexts");
    ok(cm.contexts.registered.contains(this.a.name), "should have registered context a");
    ok(cm.contexts.registered.contains(this.b.name), "should have registered context b");
    ok(cm.contexts.registered.contains(this.c.name), "should have registered context c");
		ok(cm.relations, "should have relations");
		equal(cm.contexts.active.length, 0, "should have no active contexts");
		equal(cm.contexts.toActivate.length, 0, "should have no contexts to activate");
		equal(cm.contexts.toDeactivate.length, 0, "should have no contexts to deactivate");
    ok(cm.composer, "should have composer");
    ok(cm.resolvedTraits, "should have resolvedTraits");
    equal(cm.originalObjects.length, 0, "should have no adaptations stored in original objects");

    try {
      cm = new Cop.ContextManager({
      });      
      ok(false, "should throw error creating context manager without 'contexts' paramter");
    } catch(err) {
      equal(err.message, "Cannot create context manager without contexts.");
    }

    try {
      cm = new Cop.ContextManager({
        contexts: undefined,
      });      
      ok(false, "should throw error creating context manager with contexts parameter undefined");
    } catch(err) {
      equal(err.message, "Cannot create context manager without contexts.");
    }

    try {
      cm = new Cop.ContextManager({
        contexts: {},
      });      
      ok(false, "should throw error creating context manager without an array with contexts");
    } catch(err) {
      equal(err.message, "Cannot create context manager without contexts.");
    }

    try {
      cm = new Cop.ContextManager({
        contexts: [],
      });      
      ok(false, "should throw error creating context manager with empty contexts");
    } catch(err) {
      equal(err.message, "Cannot create context manager without contexts.");
    }

    try {
      cm = new Cop.ContextManager({
        contexts: [this.a, this.b, this.b],
      });      
      ok(false, "should throw error passing two identical contexts");
    } catch(err) {
      equal(err.message, "Already registered context: b.");
    }

  });
  
  test("ContextManager: TODO creation with relations", function() {
    var cm = new Cop.ContextManager({
      contexts: [this.a, this.b, this.c],
      relations: [
       // TODO
      ]
    });
    
  });

  test("ContextManager: TODO start", function() {

  });
    
  test("ContextManager: TODO resolveConflict", function() {

  });
});