(function(){
  
  // Ignore debug messages.
  var oldConsoleLog = console.log;
  console.log = function() {};
  
  JSLitmus.test( 'Context: creation', function() {
    new copContext();
  });
  
  var context = new copContext();
  
  // Context declared globally with no adapted objects.
  JSLitmus.test( 'Context global: activation + deactivation', function( count ) {
    while ( count-- ) {
      context.activate();
      context.deactivate();
    }
  });
  
  // Context declared locally with no adapted objects.
  JSLitmus.test( 'Context local: activation + deactivation', function( count ) {
    var context = new copContext();
    while ( count-- ) {
      context.activate();
      context.deactivate();
    }
  });
  
  var context = new copContext(); 
  var object = { toString: function() { return 'original_toString'; }};
  var trait = Trait({ toString: function() { return 'adapted_toString'; }});
  
  JSLitmus.test( 'Context: simple adaptation + unadaptation', function() {
    context.adapt( object, trait );
    context.unadapt( object );
  });

  // Test an empty function call, which we can use as a reference point
  JSLitmus.test( 'Empty function call', function( count ) {
    var f = function() {};
    while (count--) f();
  });
  
  console.log = oldConsoleLog;
})();