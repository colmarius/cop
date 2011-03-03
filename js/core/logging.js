//
//  Disable browser logging messages to console.log
//  when debug mode is false.
//
(function() {

// Load cop if not loaded already
cop.load();

// Define context
var disableConsoleLog = new copContext( "disableConsoleLog" );

// Define adaptation
disableConsoleLog.adapt( console, Trait({
  log: function(msg) {}
}));

// Default debug mode
debug = true;

// Extend cop with debug method
cop.setDebug = function ( state )
{
  debug = state;
  
  if (debug)
  {
    disableConsoleLog.deactivate();
  }
  else 
  {
    disableConsoleLog.activate();
  }
}

// Initialize
cop.setDebug( debug );

}());