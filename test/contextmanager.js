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

		ok(cm.contexts, "should have contexts");
    ok(cm.contexts.contains(this.a.name), "should have registered context a");
    ok(cm.contexts.contains(this.b.name), "should have registered context b");
    ok(cm.contexts.contains(this.c.name), "should have registered context c");
		ok(cm.relations, "should have relations");
		ok(cm.contextsActive, "should have active contexts");
		ok(cm.contextsToActivate, "should have contexts to activate");
		ok(cm.contextsToDeactivate, "should have contexts to deactivate");

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
      ok(false, "should throw error creating context manager with 'contexts' parameter undefined");
    } catch(err) {
      equal(err.message, "Cannot create context manager without contexts.");
    }

    try {
      cm = new Cop.ContextManager({
        contexts: {},
      });      
      ok(false, "should throw error creating context manager without an array 'contexts' ");
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
        { 
          context: this.a,
          include: [this.b], 
          exclude: [this.c]
        }
      ]
    });
    
    var aRelation = cm.relations.lookup(this.a.name);
    
    equal(aRelation.context.name, this.a.name);
    equal(aRelation.include[0].name, this.b.name);
    equal(aRelation.exclude[0].name, this.c.name);
  });
    
});