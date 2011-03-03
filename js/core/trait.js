/**
 copTrait
 ========
 
 Handles the trait composition part for the library. Wraps around the Trait
 object provided by traitsjs library. For more info on traitsjs 
 see: [www.traitsjs.org].
 
 Methods
 -------
 
 - `create(object, trait)`
 
 Returns a `newObject` where the trait is applied on the object. The trait 
 methods inside the `newObject` can access the "original" object through 
 `this.original` (which is a reference to "object").
 Example code:

		var obj = {
			toString: function(){
				return "foo";
			}
		};
		var newObj = copTrait.create(obj, Trait({
			toString: function(){
				return "new " + this.original.toString();
			}
		}));
		
		newObj.toString() === "new " + obj.toString(); // true
		
 - `compose(traits)`
 
 - `override(traits)`
 
 - `getTraits(object, contexts)`
 
 - `hasConflicts(trait)`
 
 */
copTrait = {
  
   create: function(object, trait)
  {
//    console.log( "FIXME: Trait.create() binds this. " + 
//                  "Object.create() does not do that.." );
//    return Object.create( object, composedTrait );
    
    var composedTrait = Trait.compose( trait, Trait({original: object}) );    
    return Trait.create( object, composedTrait ); // binds this on returned object
  }
  
  ,compose: function(traits) 
  {
  	var composedTrait = Trait.compose2.apply( null, traits );
		
  	console.log( "Composing traits:", traits, "into composed trait:", composedTrait );
    
    return composedTrait;
  }
  
  ,override: function(traits)
  {
    console.log( "Overriding traits:", traits );
    
    return Trait.override.apply( null, traits );
  }
  
  ,getTraits: function(object, contexts)
  {
    var i, len, t, traits = [];
    
    for (i = 0, len = contexts.length; i < len; i += 1) {
      t = contexts[i].getTrait( object );  
      if (t) {
        traits.push( t );
      }
    }
    return traits;
  }
  
  ,hasConflicts: function(trait)
  {
    for (var name in trait)  {
      if (trait[name].conflict) {
        return true;
      }
    }
    return false;
  }
};
