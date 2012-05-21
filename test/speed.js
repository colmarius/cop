(function(){

  var object = {
    methodOne: function() {},
    methodTwo: function() {}
  };

  var contextOne = new Cop.Context({
    name: 'contextOne',
    initialize: function() {}
  });

  var contextTwo = new Cop.Context({
    name: 'contextTwo',
    initialize: function() {}
  });

  contextOne.adapt(object, Trait({
    methodOne: function() {}
  }));

  contextTwo.adapt(object, Trait({
    methodOne: function() {}
  }));

  var manager = new Cop.ContextManager({
    contexts: [contextOne, contextTwo]
  });

  manager.resolveConflict(object, [contextOne, contextTwo], 
    function(contextOneT, contextTwoT) {
      return Trait.override(contextOneT, contextTwoT);
  });
  
  JSLitmus.test('Context: activate + deactivate', function() {
    contextOne.activate();
    contextOne.deactivate();
  });
  
  JSLitmus.test('Context twice: activate + deactivate', function() {
    contextOne.activate();
    contextOne.deactivate();
    contextOne.activate();
    contextOne.deactivate();
  });

  JSLitmus.test('Two contexts with conflict: activate + deactivate', function() {
    contextOne.activate();
    contextTwo.activate();
    contextOne.deactivate();
    contextTwo.deactivate();
  });

})();
