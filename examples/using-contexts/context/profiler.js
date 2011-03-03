/**
  We will write a context to profile object methods. We want to see how long 
  it takes in seconds to run a metod.
  
  We create a context, call it Profiler. Then we will extend it..
  
 */

var Profiler = new copContext( "Profiler" );

Profiler.profile = function( object, methods ) {
  var profiledObject = {}, name;
  
  for( var i in methods ) {
    name = methods[i];
    profiledObject[name] = this._makeProfiledProperty( name ); 
  }
  this.adapt( object, Trait( profiledObject ) );
};

Profiler._makeProfiledProperty = function( name ) {
  var profilingFunc = function( var_args ) {
    var start, time, ret;
    start = new Date();
    if( typeof this.original[name] === "function" ) {
       // If is a function call it.
       ret = this.original[name].apply( this.original, arguments );
       // Log running time.
       time = Math.max(1,new Date() - start)/1000;
       logger.log( name + " tooked " + time + " seconds to run." );
    } else {
      ret = this.original[name];
    }
    return ret;
  }
  return profilingFunc;
}

Profiler.profile( App, ["init"] );

Profiler.adapt( test, Trait({
  foo: function( ) {
    return "Profiler version";
  }
}));
