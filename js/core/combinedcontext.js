/**
 - - -
 
 copCombinedContext
 ==================
 
 Constructor function. Returns a combined context object that observes the 
 contexts passed as arguments and becomes active when all of them are active.
 
 Extends
 -------
 
 - `copContext`
 
 Methods
 -------
 
 - `adapt(object, trait1, trait2..)`
 
 Use
 ---
 
		// We create two simple contexts
		var ctxA = new copContext( "A" );
		var ctxB = new copContext( "B" );
		
		// We create the combined context for the two above
		var ctxAB = new copCombinedContext( policy, ctxA, ctxB );
		
		// We use the combined context to adapt objects like a normal context
		ctxAB.adapt( some_object, Trait({
  	
			methodWithConflicts: function() {
				// give here specific implementation
			}
  		
		});
 
 */
copCombinedContext = function(var_args)
{
  var  self = this
      ,policy = arguments[0]
      ,contexts = Array.prototype.slice.call(arguments, 1)
      ;
  
	this.policy = policy;
  this.activeSubContexts = new copHashSet( );
  this.subContexts = new copHashSet(  );
  this.subContexts.addAll( contexts );
	
	copContext.call( this );
  
  self.subContexts.each( function ( subContext ) {
    subContext.activateEvent.subscribe( self.onSubContextActivate, self );
    subContext.deactivateEvent.subscribe( self.onSubContextDeactivate, self );
  });
};

copCombinedContext.extend(copContext, {
	
   activate: function()
  {
    throw "Combined context cannot be programmatically activated";
  }
  
  ,deactivate: function()
  {
    throw "Combined context cannot be programmatically deactivated";
  }
  
  ,onSubContextActivate: function(context)
  {
    if (this.activeSubContexts.contains( context ) === false) 
    {
      this.activeSubContexts.add( context );
      
      if ((this.active === false) && (this.activeSubContexts.size( ) === this.subContexts.size( ))) 
      {
        this.switchOn( );
      }
    }
  }
  
  ,onSubContextDeactivate: function(context)
  {
    if (this.activeSubContexts.contains( context ) === true) 
    {
      this.activeSubContexts.remove( context );
      
      if (this.active === true) 
      {
        this.switchOff( );
      }
    }
  }
  
  ,toString: function()
  {
    return "CombinedContext" + this.id + "{" + this.subContexts.values() + "}";
  }
});
