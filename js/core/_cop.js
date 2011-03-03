/**
 cop
 ===
 
 Singleton used by the library to store global information and some utility 
 methods.
 
 Methods
 -------
 
 - `load()`
 
 Used to load the `cop` library. Initializes the `copContextManager` with the 
 default context.
 
 Function
 ========
 
 It extends the Function object to add a few goodies which augment JavaScript
 in a fairly non-intrusive way.
 
 Methods
 -------
 
 - `extend(superclass, prototype)`
 
 Gives you an easy way to extend a class using JavaScript's natural prototypal
 inheritance.
 
 */
// syntactic sugar to make it easier to extend a class
Function.prototype.extend = function(superclass, proto)
{
  // create our new subclass
  this.prototype = new superclass();
  
  // optional subclass methods and properties
  if (proto) 
  {
    for (var i in proto)
    {
      this.prototype[i] = proto[i];
    }
  }
};

// no console.log?
if (typeof console === 'undefined' || typeof console.log !== 'function') 
{
  console = { log: function(msg) {} };
}

cop = {
   version: "0.1"
  
  ,contextId: 0
  ,nextContextId: function()
  {
    return this.contextId++;
  }
  
  ,contextActivationCounter: 1
  ,nextContextActivationCounter: function()
  {
    return this.contextActivationCounter++;
  }
  
  ,loaded: false
  ,load: function()
  {
    if (this.loaded) { 
      return; 
    }
    if (copContextManager) {
      copContextManager.initialize();
    }
    this.loaded = true;
  }
  
  ,getVersion: function()
  {
    return this.version;
  }
}
