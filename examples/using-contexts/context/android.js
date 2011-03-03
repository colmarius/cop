/**
  The Android context is used to append log messages to a div tag.
  
  First we create our `Android` context. Second we adapt the `logger` object
  with a trait that gives a new implementation for the `log` method.
  
  Inside the `log` method we use jQuery to select the div element with id 
  "info". Then messages sent to our loggers `log` method are appended to the 
  div element with id = "info".
  
  In order to activate our context we will have to do it programmatically
  by calling `Android.activate()`. 
  
  The `logger` object has to be loaded in order to be adapted by the Android
  context. Also the context has to be activated before any call to the logger's
  log method, as to reflect our changes to the `log` method.
 */

var Android = new copContext( "Android" );

// Context specific behaviour changes.
Android.adapt( logger, Trait({
  log: function( msg ) {
    $("#info").append( "<p>" + msg + "<p>" );
  }
}));

// Watch for context activation.
Android.activateEvent.subscribe( function() {
  $("body").append( "<div id=\"info\" \/>" );
});

// Watch for context deactivation.
Android.deactivateEvent.subscribe( function() {
  $("#info").empty().remove();
});