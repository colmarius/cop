/**
 copContext
 ==========
 
 Constructor function. Creates and returns a new context object, then it 
 registers it to the context manager (`copContextManager`). If `opt_publicName` 
 is specified then the context gets published under that public name. Otherwise
 it gets published under an anonymous auto-generated name.
 
 Events
 ------
 
 - `activateEvent`
 - `deactivateEvent`
 - `adaptEvent`
 
 Methods
 -------
 
 - `activate()`
 
 The state of the context will be `active`. Notifies the context manager to 
 recompose all adapted objects under this context. Recomposition takes count for
 all current active contexts.
 
 - `deactivate()`
 
 The state of the context will be `inactive`. Notifies the context manager to 
 recompose all adapted objects under this context. Recomposition takes count for
 all current remaining active contexts.
 
 - `adapt(object, trait1, trait2..)`
 
 Saves a request to adapt the `object` with one or more traits when this context
 will become active. First, the traits are immediately composed. If there are
 conflicts an composition error is immediately raised. Second, when the 
 context will become active this traits will be composed with other traits from
 other active contexts, if any for this object, and successively will be applied
 to the object and make part of its behavior. If there are conflicts and are 
 not resolved by *the (default) policy*  then an error will be thrown.
 
 */
copContext = function(opt_publicName)
{
  this.id = cop.nextContextId( );
  this.name = opt_publicName || ("anonymous_" + this.id);
  
  this.active = false;
  this.activationCounter = null;
  
  this.adaptedObjects = new copHashtable( );
  
  this.activateEvent = new copSubject( this );
  this.deactivateEvent = new copSubject( this );
  this.adaptEvent = new copSubject( this );
  
  copContextManager.register( this );
  
  copContextRegistry.publish( this, this.name );
};

copContext.prototype = {
  
  activate: function()
  {
    if (!this.active) 
    {
      this.switchOn( );
    }
    return this;
  }
  
  ,deactivate: function()
  {
    if (this.active) 
    {
      this.switchOff( );
    }
    return this;
  }
  
  ,switchOn: function() 
  {
     this.active = true;
     this.activationCounter = cop.nextContextActivationCounter( );
     
     console.log( "Activating... " + this );
     
     this.activateEvent.fire( this );
  }
  
  ,switchOff: function()
  {
    this.active = false;
    this.activationCounter = null;
    
    console.log( "Deactivating... " + this );
    
    this.deactivateEvent.fire( this ); 
  }
  
  ,adapt: function(var_args)
  {
    var  object = arguments[0]
        ,traits = Array.prototype.slice.call( arguments, 1 )
        ;
    
    console.log( this.toString( ), "adapts object:", object, 
                  "with traits:", traits );
    
    if( object === null || object === undefined )
    {
       throw "Cannot adapt null or undefined object!";
    }
    if( typeof object !== "object" )
    {
       throw "Cannot adapt " + (typeof object) + ". Only objects can be adapted!";
    }
    if( Object.isFrozen && Object.isFrozen( object ) )
    {
      throw "Cannot adapt frozen object!";
    }
    if( this.adaptedObjects.containsKey( object ) )
    {
      // Fits need of default context to adapt object just once.
      console.log( "Skipping adaptation for object:", object, 
                    "Already has one under context:", this.toString() );
      return;
    }
    if (traits.length >= 1) 
    {
      if (traits.length === 1) 
      {
        this.setTrait( object, traits[0] );
      }
      else {
            this.setTrait( object, copTrait.compose(traits) );
           }    
      this.adaptEvent.fire( object );
    }
    return this;
  }
  
  ,unadapt: function( object )
  {
    if( !object ) {
      return; 
    }
    console.log( this.toString(), "unadapts object:", object );
    
    this.adaptedObjects.remove( object );
    
    return this;
  }
  
  ,setTrait: function( object, trait )
  {
    try 
    {
      Trait.create( object, trait );
    } 
    catch (e) 
    {
      console.log( "ERROR: Cannot adapt object:", object, "Trait has conflicts:", trait );
      throw e;
    }
    this.markTrait( trait );
 
    this.adaptedObjects.put( object, trait );
    
    return this;
  }
  
  ,markTrait: function( trait )
  { 
    for( var name in trait )
    {
      trait[name].context = this;
    }
    return this;
  }
  
  ,getTrait: function( object )
  {
    if (this.adaptedObjects.containsKey( object )) 
    { 
      return this.adaptedObjects.get( object );
    }
    return null;
  }
  
  ,toString: function( )
  {
    return "Context" + this.id + (this.name !== "" ? "[\"" + this.name + "\"]" : "");
  }
};
