$(document).ready(function() {

  module("Cop.ContextManager");

  test("ContextManager: creation", function() {
		var contextManager;
	 
		contextManager = new Cop.ContextManager({
			contexts: ['a', 'b', 'c'],
			relations: {}
		});

		ok(contextManager.contexts, "should have contexts");
		ok(contextManager.relations, "should have relations");
		ok(contextManager.currentActive, "should have current active contexts");
		ok(contextManager.toActivate, "should have contexts to activate");
		ok(contextManager.toDeactivate, "should have contexts to deactivate");

		try {
			contextManager = new Cop.ContextManager({
				contexts: ['a','b','b'],
				relations: {}
			});
			ok(false, "should throw error trying to pass contexts with same name");
		} catch(err) {
			equal(err.message, "Context manager has context: b.");
		}

		try {
			contextManager = new Cop.ContextManager({
				contexts: ['a','b','c'],
				relations: {'a': {include: 'b', exclude: 'd'}}
			});
			ok(false, "should throw error trying store relation regarding 'd'");
		} catch(err) {
			equal(err.message, "Unregistered context 'd'.");
		}

  });

  test("ContextManager: getContext", function() {
		var contextManager = new Cop.ContextManager({
			contexts:	['a','b','c'],
			relations: {}
		});
		
		ok(contextManager.getContext('a'), "should have context");
		ok(contextManager.getContext('b'), "should have context");
		ok(contextManager.getContext('c'), "should have context");
		equal(contextManager.getContext('d'), undefined, "should not have context");

  });

  test("ContextManager: getRelation", function() {
		var contextManager = new Cop.ContextManager({
			contexts:	['a','b','c'],
			relations: {'a': {include: 'b', exclude: ['c']},
									'c': {include: ['a'], exclude: 'b'}}
		});
		
		var aRelation = contextManager.getRelation('a');
		var cRelation = contextManager.getRelation('c');
		
		equal(aRelation.context, 'a');
		equal(aRelation.include[0], 'b');
		equal(aRelation.exclude[0], 'c');
		equal(cRelation.include[0], 'a');
		equal(cRelation.exclude[0], 'b');

  });

  test("ContextManager: ...", function() {
		var contextManager = new Cop.ContextManager({
			contexts:	 ["battery:low",
								 	"battery:normal",
								 	"network:offline",	
								 	"network:online",	
								 	"network:3g",	
								 	"network:wifi"],

			relations: {"battery:low": {excludes: ["battery:normal"],
																	includes: ["network:offline"]},

									"battery:normal" : {excludes: ["battery:low"]},

									"network:online" : {excludes: ["network:offline"]},

									"network:offline" : {excludes: ["network:online",
																									"network:3g",
																									"network:wifi"]}}
		});
  });

});
