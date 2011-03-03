/**
 In our program we have two objects: logger and App.
 
 The logger object receives a message parameter, and prints it to the console.
 
 The App object is the main object of our application. What it does it just 
 simulates a running application when the init function is called. 
 
 It has two methods:
 
 1. init: starting point of our application;
 
 2. work: it is called by init; just logs some messages.
 
 */

var logger, App, test = { foo: function(){ return "original version"; } };

logger = { log: function( msg ) { console.log( msg ); } };

App = {
  init: function( ) { 
    logger.log( "Application started." );
    this.work( "hard" );
  }
  ,work: function( ) {
    logger.log( "doing main work.." );
    logger.log( );
    logger.log( "finishing up.." );
    logger.log( "Done." ); 
  }
}