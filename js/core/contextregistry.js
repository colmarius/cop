/**
 copContextRegistry
 ==================
 
 Singleton object that handles context publishing. Contexts can be published to
 a context registry under a public name, and retrieved later on from the same
 context registry by providing the correct public name.
 
 Methods
 -------
 
 - `publish(context, publicName)`
 
 - `retrieve(publicName)`
 
 Use
 ---
 
 Example code:
 
		copContextRegistry.publish(context, "a-context");
		retrievedContext = copContextRegistry.retrieve("a-context");
		context === retrievedContext // true
 
 */
copContextRegistry = {
  
  registry: {}
  
  ,publish: function( context, publicName )
  {
    var alreadyRegistered = this.registry[publicName];
    
    if( context && !alreadyRegistered ) {
      this.registry[publicName] = context;
      //console.log("Published context:", context, "under public name:", publicName);
    } 
    else if( alreadyRegistered ) {
      throw "Context already published under name: " + publicName;
    } else {
      throw "No context object to publish";
    }
  }
  
  ,retrieve: function( publicName )
  {
    var ret = this.registry[publicName];
    return ret !== undefined ? ret : null;
  }
};
