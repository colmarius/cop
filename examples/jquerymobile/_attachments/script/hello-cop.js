$(document).ready( function() {

  // Create context.
  var LowBattery = new copContext( "LowBattery" );
  
  // Adapt jquerymobile changePage method under our LowBattery context.
  LowBattery.adapt( $.mobile, Trait({
      changePage: function(to, transition, back, changeHash) {
        console.log( "Ignored transition: " + (transition || $.mobile.defaultTransition) + 
                      ", to page: " + (typeof to === "string" ? to : to[0]) + 
                      ", back: " + back +
                      ", changeHash: " + changeHash );
                      
        this.original.changePage( to, "none", (back ? back : true ), (changeHash ? changeHash : true) );
      }
  }));
  
  // Define when to activate the context.
  $("#contextActivate").bind( "click", function( event ) {
    event.preventDefault();
    
    LowBattery.activate();
      
    return false;
  });
  
  // Define when to deactivate the context.
  $("#contextDeactivate").bind( "click", function( event ) {
    event.preventDefault();
    
    LowBattery.deactivate();
    
    return false;
  });

  // Watch for context activation.
  LowBattery.activateEvent.subscribe( function() {
    $("#contextState")
      .empty()
      .append( "<strong>Context LowBattery is active there will be no animation for page transitions.</strong>" ); 
  });
  
  // Watch for context deactivation.
  LowBattery.deactivateEvent.subscribe( function() {
    $("#contextState")
    .empty()
    .append( "<strong>Context LowBattery is inactive the original behaviour will be restored.</strong>" ); 
  });
});
