$(document).ready(function() {

  module("copContextRegistry");
  
  test( "publish: null or undefined", function( ) {
    try {
      copContextRegistry.publish( null, "context" );
      ok( false, "Expected to complain about null." );
    } catch( e ) {
      equals( e.toString( ), "No context object to publish", 
              "Context published as null." );
    }
    try {
      copContextRegistry.publish( undefined, "context" );
      ok( false, "Expected context registry to complain about undefined." );
    } catch( e ) {
      equals( e.toString( ), "No context object to publish", 
              "Context published as undefined." );
    }
  });
  
  test( "publish: on context creation", function( ) {
    ok( (new copContext( "ctx" )) === copContextRegistry.retrieve( "ctx" ), 
        "" );
  });
  
  test( "retrieve: null, undefined or unpublished context name", function( ) {
    equals( copContextRegistry.retrieve(null), null, 
            "Passing null retrieves no context." );
    equals( copContextRegistry.retrieve(undefined), null, 
            "Passing undefined retrieves no context." );
    equals( copContextRegistry.retrieve("no-context-published-under-this-name"), 
            null, "Passing unpublished context name retrieves no context." );
  });
});
