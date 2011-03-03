/**
 
 copContextManager
 ================
 
 A singleton object. All created contexts are managed by the context manager. 
 This is the object that it is notified upon contexts events like activation, 
 deactivation, and adaptation requests . An adaptation request is one to adapt 
 an object with a number of traits under a certain context.
 He dictates the trait composition for all adapted objects. It also manages 
 conflicts by applying the right policy. If the context (or better said, 
 combined context) does not specify one, then the default one is used.
 
 Methods
 -------
 
 - `install(newPolicy)`
 
 Stores this policy as the most recent policy to use in case of conflicting 
 contexts. The previous policy will be called if this policy fails.
 
 - `register(context)`
 
 When a context gets created it is implicitly registered with the 
 context manager.
 
 */
copContextManager = 
{
   defaultContext: null
  ,contexts: new copHashSet( )
  ,activeContexts: new copHashSet( )
  ,policy: new copPolicy( )
  
  ,initialize: function( )
  {
    this.defaultContext = new copContext( "Default" );
    
	  this.defaultContext.activate( );
    
	  this.defaultContext.adaptEvent.unsubscribe( this.onContextAdapt, this );
    this.defaultContext.activateEvent.unsubscribe( this.onContextActivate, 
                                                    this );
    this.defaultContext.deactivateEvent.unsubscribe( this.onContextDeactivate, 
                                                      this );
  }
  
  ,install: function( newPolicy )
  {
    if( !newPolicy ) {
      return;
    }
    if( this.policy ) {
      newPolicy.setSuccessor( this.policy );
    }
    this.policy = newPolicy;
  }
  
  ,register: function( context )
  {
    console.log( "Registering context:", context.name );
    
    if (this.contexts.contains( context )) {
      return;
    }
    if (context instanceof copContext == false) {
      throw "Cannot register non context object: " + context;
    }
    this.contexts.add( context );
    
    context.adaptEvent.subscribe( this.onContextAdapt, this );
    context.activateEvent.subscribe( this.onContextActivate, this );
    context.deactivateEvent.subscribe( this.onContextDeactivate, this );
  }
  
  ,onContextActivate: function( context )
  {
    if( context.active === false ) {
      return;
    }
    this.activeContexts.add( context );
    
    this.recompose( context );
    
    console.log( "Activated: " + context );
  }
  
  ,onContextDeactivate: function( context )
  {
    if( context.active === true ) { 
      return;
    }
    
    this.activeContexts.remove( context );
    
    this.recompose( context );
    
    console.log( "Deactivated: " + context );
  }
  
  ,onContextAdapt: function( object )
  {
    if( this.defaultContext.adaptedObjects.containsKey(object) ) {
//      console.log( "Default context already has an adaptation for object:", 
//                    object );
    } 
    else {
          // FIXME: Trait( obj ) .. ignores .prototype
          // this.defaultContext.adapt( object, Trait( object ) );
          
          var objectFlatten = {};
          for( var name in object ) { 
            objectFlatten[name] = object[name]; 
          }
          this.defaultContext.adapt( object, Trait( objectFlatten ) );
        }
  }
  
  ,recompose: function( context )
  {
    var self = this, recomposingObjects = new copHashSet(), 
        isCombinedContext = (context instanceof copCombinedContext);

    recomposingObjects.addAll( context.adaptedObjects.keys( ) );
    
    if( isCombinedContext ) {
      context.subContexts.each( function( subContext ){
        recomposingObjects.addAll( subContext.adaptedObjects.keys( ) );
      });
    }
    
    console.log( "Recomposing objects: ", recomposingObjects.values( ) );    
    
    recomposingObjects.each( function( object ) {
      var  emptyObject = {}
          ,traits = []
          ,adaptingContexts = new copHashSet( )
          ,composedTrait = null
          ,policy = null
          ;
      
      console.log( "Started composing object:", object );
      
      self.activeContexts.each( function( activeContext ) {
        if( activeContext.getTrait( object ) !== null ) {
          traits.push( activeContext.getTrait(object) );
          adaptingContexts.add( activeContext );
        }
      });
      
      console.log( "Adapting contexts: ", adaptingContexts.values( ) );
      
      if( traits.length >= 1 ) 
      {
        composedTrait = copTrait.compose( traits );
        
        if( copTrait.hasConflicts( composedTrait ) ) 
        {
          console.log( "Traits are in conflict:", traits );
          
          policy = (isCombinedContext && context.policy ? context.policy : self.policy);
          
				  composedObject = policy.compose( object, adaptingContexts.values( ) );
  			  
    		  console.log( "Composed object:", composedObject, 
      	                "with policy:", policy, 
                        "for contexts:", adaptingContexts.values( ) );
        }
        else {
          composedObject = copTrait.create( emptyObject, composedTrait );
        }
        
        self.restore( object, composedObject );
        
        console.log( "Finished composing object:", object );
      }
      else {
        throw "There should be at least the default trait. No traits found for object:" + object;
      }
    });
  }
  
  ,empty: function( obj ) 
  {
    for( var name in obj ) {
      obj[name] = undefined;
      delete obj[name];
    }
  }
  
  ,restore: function( obj, fromObj ) 
  {
    var name;
    
    this.empty( obj );
    
    // FIXME: not all props are copied in object.. 
    // temp: fixed by delegating to prototype object
    for( name in fromObj ) {
      if( fromObj.hasOwnProperty(name) ) {
        obj[name] = fromObj[name];
      }
    }
    // FIXME: browser independent feature
    obj.__proto__ = fromObj.__proto__;
     
    console.log( "Object:", obj, "restored from:", fromObj );
  }
};
