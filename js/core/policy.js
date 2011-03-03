/**
 copPolicy
 =========
 
 Implements the "Chain" design pattern. The `order(contexts)` method should 
 specify how contexts should be ordered. If null is returned then the next 
 `successor` in the chain is called to first order and then compose the traits
 for the object under the given contexts.
 
 Methods
 -------
 
 - `order(contexts)`
 
 Provides the implementation on how to order the contexts. The default 
 implementation orders contexts by the most recently activated one based
 on the context activation counter. It has to be overriden in user-defined 
 policies.
 
 - `compose(object, contexts)`
 
 It first asks the policy to order the contexts, by calling the 
 `order(contexts)` method. Then it composes all the traits under the returned 
 contexts by overriding conflicts from left to right. The trait under the first
 context overrides all other traits. In the end returns the composed object
 from all the traits.
 
 - `setSuccessor(successor)`
 
 Sets the next successor in the policy chain resolution. It will be called
 if this policy should fail, meaning `order(contexts)` returns null or an empty
 array of contexts.
 
 Use
 ---
 
 Default implementation:
 
	policy.order = function(contexts){
		var ret = [];
		contexts.sort(function(ctx1, ctx2){
  	  // Last activated context is returned first
			return ctx2.activationCounter - ctx1.activationCounter;
		});
		return ret;
	}
 
 */
copPolicy = function()
{
  this.successor = null;
};

copPolicy.prototype = {
  
   order: function(contexts)
  {
    var ret = [];
    
    ret = contexts.sort( function (ctx1, ctx2) {
      // Last activated context is returned first
      return ctx2.activationCounter - ctx1.activationCounter;
    });
    console.log( "Default Policy ordered contexts: ", ret.join(",") );
    
    return ret;
  }
  
  ,compose: function(object, contexts)
  {
    var composedObject = {},
        orderedContexts = null,
        traits = null;
    
    if (!object) 
    {
      throw "Policy cannot resolve conflict. Missing object."
    }
    if (!contexts) 
    {
      throw "Policy cannot resolve conflict. Missing contexts."
    }
    orderedContexts = this.order( contexts );
    
    if (orderedContexts && orderedContexts.length > 0) 
    {
      traits = copTrait.getTraits( object, orderedContexts );
			
			traits = traits.reverse( ); // Apply the trait from the most recent activated context first

      for (var i = 0, len = traits.length; i < len; i += 1) 
      {
				composedObject = copTrait.create( composedObject, traits[i] );				
      }
			return composedObject;
    }
    else 
        if (this.successor) 
        {
          return this.successor.compose( object, contexts );
        }
        else {
              throw "Conflict not resolved for object: " + object + " and contexts: " + contexts;
             }
  }
  
  ,setSuccessor: function(successor)
  {
    this.successor = successor;
  }
};
