var logger, ConsoleLog, InfoDivLog;

logger = { log : function( msg ) {} };

ConsoleLog = new copContext( "ConsoleLog" );
ConsoleLog.adapt( logger, Trait({
  log: function( msg ) {
    console.log( msg ); 
  }
}));

DivInfoLog = new copContext( "DivInfoLog" );
DivInfoLog.adapt( logger, Trait({
  log: function( msg ) {
    $("#info").append( "<p>" + msg + "</p>" );
  }
}));

logger.log( "this message is lost" );

ConsoleLog.activate();

logger.log( "this message is going to the console" );

DivInfoLog.activate();

logger.log( 'this message is written to the div with id = "info"' );

DivInfoLog.deactivate();

logger.log( "this message is also going to the console" );

ConsoleLog.deactivate();

logger.log( "this message is also lost" );
