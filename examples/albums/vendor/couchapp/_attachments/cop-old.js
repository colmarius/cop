/**
 copLog
 ======
 
 Wrapper for `console.log()` (or whatever device-specific logging you have). Also could
 be extended to send log information to a RESTful service as well, handy for devices
 which don't have decent logging abilities.
 
 Use
 ---
 
 It's an all-in-one utility that's smart enough to ferret out whatever you throw at it
 and display it in the console.
 
		copLog("x=", x, "listdata=", listdata);
 
 Basically, fill it up with strings, variables, objects, arrays and the function will
 produce a string version of each argument (where appropriate; browser debuggers tend to
 display objects nicely) in the same console line. Simple, effective, easy to use.
 */
copLog = function() {
  
  var strings = [];
  
  for (var i = 0; i < arguments.length; i++) {
    strings.push(arguments[i]);
  }
  
  if (cop.debug) {
		console.log( strings );
  }
}
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
   version: "0.0.1"
  
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
    if (this.loaded) 
    { 
      return; 
    }
    if (copContextManager) 
    {
      copContextManager.initialize();
    }
    this.loaded = true;
  }
  
  ,getVersion: function()
  {
    return this.version;
  }
}
/**
 copHashtable
 ============
 
 Hashtable implementation taken from [jshashtable](http://www.timdown.co.uk/jshashtable/).
 
 See
 ---
 
	- [jshashtable API](http://www.timdown.co.uk/jshashtable/#api)
	
 */
copHashtable = (function(){
  var FUNCTION = "function";
  
  var arrayRemoveAt = (typeof Array.prototype.splice == FUNCTION) ? function(arr, idx){
    arr.splice(idx, 1);
  }
 : function(arr, idx){
    var itemsAfterDeleted, i, len;
    if (idx === arr.length - 1) {
      arr.length = idx;
    }
    else {
      itemsAfterDeleted = arr.slice(idx + 1);
      arr.length = idx;
      for (i = 0, len = itemsAfterDeleted.length; i < len; ++i) {
        arr[idx + i] = itemsAfterDeleted[i];
      }
    }
  };
  
  function hashObject(obj){
    var hashCode;
    if (typeof obj == "string") {
      return obj;
    }
    else 
      if (typeof obj.hashCode == FUNCTION) {
        // Check the hashCode method really has returned a string
        hashCode = obj.hashCode();
        return (typeof hashCode == "string") ? hashCode : hashObject(hashCode);
      }
      else 
        if (typeof obj.toString == FUNCTION) {
          return obj.toString();
        }
        else {
          try {
            return String(obj);
          } 
          catch (ex) {
            // For host objects (such as ActiveObjects in IE) that have no 
            // toString() method and throw an error when passed to String()
            return Object.prototype.toString.call(obj);
          }
        }
  }
  
  function equals_fixedValueHasEquals(fixedValue, variableValue){
    return fixedValue.equals(variableValue);
  }
  
  function equals_fixedValueNoEquals(fixedValue, variableValue){
    return (typeof variableValue.equals == FUNCTION) ? variableValue.equals(fixedValue) : (fixedValue === variableValue);
  }
  
  function createKeyValCheck(kvStr){
    return function(kv){
      if (kv === null) {
        throw new Error("null is not a valid " + kvStr);
      }
      else 
        if (typeof kv == "undefined") {
          throw new Error(kvStr + " must not be undefined");
        }
    };
  }
  
  var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");
  
  /*-------------------------------------------------------------------------*/
  
  function Bucket(hash, firstKey, firstValue, equalityFunction){
    this[0] = hash;
    this.entries = [];
    this.addEntry(firstKey, firstValue);
    
    if (equalityFunction !== null) {
      this.getEqualityFunction = function(){
        return equalityFunction;
      };
    }
  }
  
  var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;
  
  function createBucketSearcher(mode){
    return function(key){
      var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
      while (i--) {
        entry = this.entries[i];
        if (equals(key, entry[0])) {
          switch (mode) {
            case EXISTENCE:
              return true;
            case ENTRY:
              return entry;
            case ENTRY_INDEX_AND_VALUE:
              return [i, entry[1]];
          }
        }
      }
      return false;
    };
  }
  
  function createBucketLister(entryProperty){
    return function(aggregatedArr){
      var startIndex = aggregatedArr.length;
      for (var i = 0, len = this.entries.length; i < len; ++i) {
        aggregatedArr[startIndex + i] = this.entries[i][entryProperty];
      }
    };
  }
  
  Bucket.prototype = {
    getEqualityFunction: function(searchValue){
      return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
    },
    
    getEntryForKey: createBucketSearcher(ENTRY),
    
    getEntryAndIndexForKey: createBucketSearcher(ENTRY_INDEX_AND_VALUE),
    
    removeEntryForKey: function(key){
      var result = this.getEntryAndIndexForKey(key);
      if (result) {
        arrayRemoveAt(this.entries, result[0]);
        return result[1];
      }
      return null;
    },
    
    addEntry: function(key, value){
      this.entries[this.entries.length] = [key, value];
    },
    
    keys: createBucketLister(0),
    
    values: createBucketLister(1),
    
    getEntries: function(entries){
      var startIndex = entries.length;
      for (var i = 0, len = this.entries.length; i < len; ++i) {
        // Clone the entry stored in the bucket before adding to array
        entries[startIndex + i] = this.entries[i].slice(0);
      }
    },
    
    containsKey: createBucketSearcher(EXISTENCE),
    
    containsValue: function(value){
      var i = this.entries.length;
      while (i--) {
        if (value === this.entries[i][1]) {
          return true;
        }
      }
      return false;
    }
  };
  
  /*-------------------------------------------------------------------------*/
  
  // Supporting functions for searching hashtable buckets
  
  function searchBuckets(buckets, hash){
    var i = buckets.length, bucket;
    while (i--) {
      bucket = buckets[i];
      if (hash === bucket[0]) {
        return i;
      }
    }
    return null;
  }
  
  function getBucketForHash(bucketsByHash, hash){
    var bucket = bucketsByHash[hash];
    
    // Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
    return (bucket && (bucket instanceof Bucket)) ? bucket : null;
  }
  
  /*--------------------------------------------------------------------------*/
  
  function Hashtable(hashingFunctionParam, equalityFunctionParam){
    var that = this;
    var buckets = [];
    var bucketsByHash = {};
    
    var hashingFunction = (typeof hashingFunctionParam == FUNCTION) ? hashingFunctionParam : hashObject;
    var equalityFunction = (typeof equalityFunctionParam == FUNCTION) ? equalityFunctionParam : null;
    
    this.put = function(key, value){
      checkKey(key);
      checkValue(value);
      var hash = hashingFunction(key), bucket, bucketEntry, oldValue = null;
      
      // Check if a bucket exists for the bucket key
      bucket = getBucketForHash(bucketsByHash, hash);
      if (bucket) {
        // Check this bucket to see if it already contains this key
        bucketEntry = bucket.getEntryForKey(key);
        if (bucketEntry) {
          // This bucket entry is the current mapping of key to value, so replace old value and we're done.
          oldValue = bucketEntry[1];
          bucketEntry[1] = value;
        }
        else {
          // The bucket does not contain an entry for this key, so add one
          bucket.addEntry(key, value);
        }
      }
      else {
        // No bucket exists for the key, so create one and put our key/value mapping in
        bucket = new Bucket(hash, key, value, equalityFunction);
        buckets[buckets.length] = bucket;
        bucketsByHash[hash] = bucket;
      }
      return oldValue;
    };
    
    this.get = function(key){
      checkKey(key);
      
      var hash = hashingFunction(key);
      
      // Check if a bucket exists for the bucket key
      var bucket = getBucketForHash(bucketsByHash, hash);
      if (bucket) {
        // Check this bucket to see if it contains this key
        var bucketEntry = bucket.getEntryForKey(key);
        if (bucketEntry) {
          // This bucket entry is the current mapping of key to value, so return the value.
          return bucketEntry[1];
        }
      }
      return null;
    };
    
    this.containsKey = function(key){
      checkKey(key);
      var bucketKey = hashingFunction(key);
      
      // Check if a bucket exists for the bucket key
      var bucket = getBucketForHash(bucketsByHash, bucketKey);
      
      return bucket ? bucket.containsKey(key) : false;
    };
    
    this.containsValue = function(value){
      checkValue(value);
      var i = buckets.length;
      while (i--) {
        if (buckets[i].containsValue(value)) {
          return true;
        }
      }
      return false;
    };
    
    this.clear = function(){
      buckets.length = 0;
      bucketsByHash = {};
    };
    
    this.isEmpty = function(){
      return !buckets.length;
    };
    
    var createBucketAggregator = function(bucketFuncName){
      return function(){
        var aggregated = [], i = buckets.length;
        while (i--) {
          buckets[i][bucketFuncName](aggregated);
        }
        return aggregated;
      };
    };
    
    this.keys = createBucketAggregator("keys");
    this.values = createBucketAggregator("values");
    this.entries = createBucketAggregator("getEntries");
    
    this.remove = function(key){
      checkKey(key);
      
      var hash = hashingFunction(key), bucketIndex, oldValue = null;
      
      // Check if a bucket exists for the bucket key
      var bucket = getBucketForHash(bucketsByHash, hash);
      
      if (bucket) {
        // Remove entry from this bucket for this key
        oldValue = bucket.removeEntryForKey(key);
        if (oldValue !== null) {
          // Entry was removed, so check if bucket is empty
          if (!bucket.entries.length) {
            // Bucket is empty, so remove it from the bucket collections
            bucketIndex = searchBuckets(buckets, hash);
            arrayRemoveAt(buckets, bucketIndex);
            delete bucketsByHash[hash];
          }
        }
      }
      return oldValue;
    };
    
    this.size = function(){
      var total = 0, i = buckets.length;
      while (i--) {
        total += buckets[i].entries.length;
      }
      return total;
    };
    
    this.each = function(callback){
      var entries = that.entries(), i = entries.length, entry;
      while (i--) {
        entry = entries[i];
        callback(entry[0], entry[1]);
      }
    };
    
    this.putAll = function(hashtable, conflictCallback){
      var entries = hashtable.entries();
      var entry, key, value, thisValue, i = entries.length;
      var hasConflictCallback = (typeof conflictCallback == FUNCTION);
      while (i--) {
        entry = entries[i];
        key = entry[0];
        value = entry[1];
        
        // Check for a conflict. 
        // The default behaviour is to overwrite the value for an existing key
        if (hasConflictCallback && (thisValue = that.get(key))) {
          value = conflictCallback(key, thisValue, value);
        }
        that.put(key, value);
      }
    };
    
    this.clone = function(){
      var clone = new copHashtable(hashingFunctionParam, equalityFunctionParam);
      clone.putAll(that);
      return clone;
    };
  }
  
  return Hashtable;
})();
/**
 copHashSet
 ==========
 
 Based on `copHashtable`.
 
 Also See
 --------
 
 - [jshashtable](http://www.timdown.co.uk/jshashtable/).
 
 */
copHashSet = function(hashingFunction, equalityFunction){

  var hashTable = new copHashtable(hashingFunction, equalityFunction);
  
  this.add = function(o){
    hashTable.put(o, true);
  };
  
  this.addAll = function(arr){
    var i = arr.length;
    while (i--) {
      hashTable.put(arr[i], true);
    }
  };
  
  this.values = function(){
    return hashTable.keys();
  };
  
  this.remove = function(o){
    return hashTable.remove(o) ? o : null;
  };
  
  this.contains = function(o){
    return hashTable.containsKey(o);
  };
  
  this.clear = function(){
    hashTable.clear();
  };
  
  this.size = function(){
    return hashTable.size();
  };
  
  this.isEmpty = function(){
    return hashTable.isEmpty();
  };
  
  this.clone = function(){
    var h = new copHashSet(hashingFunction, equalityFunction);
    h.addAll(hashTable.keys());
    return h;
  };
  
  this.each = function(callback){
    var entries = hashTable.entries(), i = entries.length, entry;
    while (i--) {
      entry = entries[i];
      callback(entry[0]);
    }
  };
  
  this.intersection = function(hashSet){
    var intersection = new copHashSet(hashingFunction, equalityFunction);
    var values = hashSet.values(), i = values.length, val;
    while (i--) {
      val = values[i];
      if (hashTable.containsKey(val)) {
        intersection.add(val);
      }
    }
    return intersection;
  };
  
  this.union = function(hashSet){
    var union = this.clone();
    var values = hashSet.values(), i = values.length, val;
    while (i--) {
      val = values[i];
      if (!hashTable.containsKey(val)) {
        union.add(val);
      }
    }
    return union;
  };
  
  this.isSubsetOf = function(hashSet){
    var values = hashTable.keys(), i = values.length;
    while (i--) {
      if (!hashSet.contains(values[i])) {
        return false;
      }
    }
    return true;
  };
}

/**
 copSubject
 ==========
 
 Class for custom events using the Observer Pattern. This is designed to be used
 inside a subject to create events which observers can subscribe to. Unlike
 the classic observer pattern, a subject can fire more than one event when called,
 and each observer gets data from the subject. This is very similar to YUI 2.x
 event model.
 
 You can also "lock" the notification chain by using the `capture()` method, which
 tells the event to only notify the most recent subscriber (observer) which requested
 to capture the event exclusively.
 
 Methods
 -------
 
 - `subscribe(Function, context, data)`
 
 Both `context` and `data` are optional. Also, you may use the `Function.bind(this)`
 approach instead of passing in the `context` as a separate argument.
 All subscribers will be notified when the event is fired.
 
 - `unsubscribe(Function, context)`
 
 Does what you'd think. The `context` is only required if you used one when
 you set up a subscriber.
 
 - `capture(Function, context, data)`
 
 Only the last subscriber to capture this event will be notified until it is
 released. Note that you can stack `capture()` calls to produce a modal event
 heiarchy. Used in conjunction with the `resume()` method, you can build an
 event chain where each observer can fire the next based on some decision making.
 
 - `release(Function, context)`
 
 Removes the most recent subscription called with `capture()`, freeing up the next
 subscribers in the list to be notified the next time the event is fired.
 
 - `fire(data)`
 
 Calls subscriber methods for all observers, and passes in: `data` from the subject,
 a reference to the `subject` and any static `data` which was passed in the
 `subscribe()` call.
 
 - `resume(data)`
 
 If you used `capture()` to subscribe to this event, you can continue notifying
 other subscribers in the chain with this method. The `data` parameter, as in
 `fire()`, is optional.
 
 Use
 ---
 
 ### In the subject (or "publisher") object
 
		// inside the Subject, we setup an event observers can subscribe to
		this.changeEvent = new copSubject(this);
		
		// to fire the event inside the Subject
		this.changeEvent.fire(somedata);
		
 ### In the observer (or "subscriber") object
 
		// simple case, using Function.bind()
		somesubject.changeEvent.subscribe(this.mymethod.bind());
		
		// explicit context (this)
		somesubject.changeEvent.subscribe(this.mymethod, this);
		
		// optional data which gets passed with the event fires
		somesubject.changeEvent.subscribe(this.mymethod, this, "hello");
		
 This is a very flexible way to handle messages between objects. Each subject
 may have multiple events which any number of observer objects can subscribe
 to.
 
 */
copSubject = function(subject)
{
  this.subscriptions = [];
  this.subject = subject;
};

copSubject.prototype = {
  
  last: -1,
  
  subscribe: function(call, observer, data){
    if (!call) 
      return false;
    
    var o = {
      "call": call
    };
    
    if (observer) 
      o.observer = observer;
    
    if (data) 
      o.data = data;
    
    this.subscriptions.push(o);
    //this.subscriptions.unshift(o);
    
    return this.subject;
  },
  
  unsubscribe: function(call, observer){
    if (!call) 
      return false;
    
    for (var i = 0, l = this.subscriptions.length; i < l; i++) {
      var sub = this.subscriptions[i];
      if (sub.call === call && (typeof sub.observer === 'undefined' || sub.observer === observer)) {
        this.subscriptions.splice(i, 1);
        break;
      }
    }
    
    return this.subject;
  },
  
  resume: function(data){
    if (this.last != -1) 
      this.fire(data, true);
    
    return this.subject;
  },
  
  fire: function(data, resume){
    if (typeof data === 'undefined') 
      data = "";
    
    var i = (resume) ? (this.last || 0) : 0;
    
    // reset our call stack
    this.last = -1;
    
    for (var l = this.subscriptions.length; i < l; i++) {
      var sub = this.subscriptions[i];
      var subjectdata = (typeof sub.data !== 'undefined') ? sub.data : null;
      
      if (sub.observer) 
        sub.call.call(sub.observer, data, this.subject, subjectdata);
      else 
        sub.call(data, this.subject, subjectdata);
      
      // if this subscriber wants to capture events,
      // stop calling other subscribers
      if (sub.capture) {
        this.last = i + 1;
        break;
      }
    }
    
    return this.subject;
  },
  
  capture: function(call, observer, data){
    if (!call) 
      return false;
    
    var o = {
      "call": call,
      capture: true
    };
    
    if (observer) 
      o.observer = observer;
    
    if (data) 
      o.data = data;
    
    this.subscriptions.unshift(o);
    
    return this.subject;
  },
  
  release: function(call, observer){
    return this.unsubscribe(call, observer);
  }
};

/**
 copPolicy
 =========
 
 Implements the "Chain" design pattern. The `order(contexts)` method should specify
 how contexts should be ordered. If null is returned then the next `successor` 
 in the chain is called to first order and then compose the traits for the object
 under the given contexts.
 
 Methods
 -------
 
 - `order(contexts)`
 
 Provides the implementation on how to order the contexts.  The default 
 implementation orders contexts by the most recently activated one. It has to be
 overriden in user-defined policies.
 
 - `compose(object, contexts)`
 
 It first asks the policy to order the contexts, by calling the `order(contexts)`
 method. Then it composes all the traits under the returned contexts by overriding
 conflicts from left to right. The trait under the first context overrides all
 other traits. In the end returns the composed trait created.
 
 - `setSuccessor(successor)`
 
 Sets the next successor in the policy chain resolution. It will be called
 if this policy should fail.
 
 Use
 ---
 
 Default implementation:
 
	policy.order = function(contexts){
		var ret = [];
		contexts.sort(function(ctx1, ctx2){
			return ctx1.activationCounter - ctx2.activationCounter;
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
    console.log("Default Policy ordered contexts: ", ret);
    
    return ret;
  }
  
  ,compose: function(object, contexts)
  {
    var  composedObject = {}
        ,orderedContexts = null
        ,traits = null
        ;
    
    if (!object) 
    {
      throw "Policy cannot resolve conflict. Missing object."
    }
    if (!contexts) 
    {
      throw "Policy cannot resolve conflict. Missing contexts."
    }
    orderedContexts = this.order( contexts );
    
    if (orderedContexts.length > 0) 
    {
      traits = copTrait.getTraits( object, orderedContexts );
			
			traits = traits.reverse( ); // Apply the least recent first

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
        else 
            {
              throw "Conflict not resolved for object: " + object + " and contexts: " + contexts;
            }
  }
  
  ,setSuccessor: function(successor)
  {
    this.successor = successor;
  }
};
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
  
  ,publish: function(context, publicName)
  {
    var alreadyRegistered = this.registry[publicName];
    
    if (context && !alreadyRegistered) 
    {
      //copLog("Publishing:", context, "under public name:", publicName);
      
      this.registry[publicName] = context;
    }
    else 
        if (alreadyRegistered) 
        {
            throw "Context already published under name: " + publicName;
        }
        else 
            {
              throw "No context object to publish";
            }
  }
  
  ,retrieve: function(publicName)
  {
    var ret = this.registry[publicName];
    
    return ret !== undefined ? ret : null;
  }
};
/**
 
 copContextManager
 ================
 
 A singleton object. All created contexts are managed by the context manager. This
 is the object that it is notified upon contexts events like activation, deactivation,
 and adaptation requests (adapt an object with a number of traits under a certain context).
 He dictates the trait composition for all adapted objects. It also manages conflicts
 by applying the right policy (default one for now).
 
 Methods
 -------
 
 - `install(newPolicy)`
 
 Stores this policy as the most recent one. The previous policy will be called if
 this new policy fails.
 
 - `register(context)`
 
 Automatically when a context gets created it is implicitly registered to the
 context manager. If it is a simple context and it has a name property not empty,
 then the context manager tries to publish the context.
 
 */
copContextManager = 
{
   defaultContext: null
  ,contexts: new copHashSet( )
  ,activeContexts: new copHashSet( )
  ,policy: new copPolicy( )
  
  ,initialize: function()
  {
    this.defaultContext = new copContext( "Default" );
    
	  this.defaultContext.activate( );
    
	  this.defaultContext.adaptEvent.unsubscribe( this.onContextAdapt, this );
    this.defaultContext.activateEvent.unsubscribe( this.onContextActivate, this );
    this.defaultContext.deactivateEvent.unsubscribe( this.onContextDeactivate, this );
  }
  
  ,install: function(newPolicy)
  {
    if (!newPolicy) 
    {
      return;
    }
    if (this.policy) 
    {
      newPolicy.setSuccessor( this.policy );
    }
    this.policy = newPolicy;
  }
  
  ,register: function(context)
  {
    copLog( "Registering context.. ", context );
    
    if (this.contexts.contains( context )) 
    {
      return;
    }
    if (context instanceof copContext == false) 
    {
      throw "Cannot register non context object: " + context;
    }
    this.contexts.add( context );
    
    context.adaptEvent.subscribe( this.onContextAdapt, this );
    context.activateEvent.subscribe( this.onContextActivate, this );
    context.deactivateEvent.subscribe( this.onContextDeactivate, this );
  }
  
  ,onContextActivate: function(context)
  {
    if (context.active === false) {
      return;
    }
    this.activeContexts.add( context );
    
    this.recompose( context );
    
    console.log( "Activated " + context + ":", context );
  }
  
  ,onContextDeactivate: function(context)
  {
    if (context.active === true) 
    { 
      return;
    }
    
    this.activeContexts.remove( context );
    
    this.recompose( context );
    
    console.log( "Deactivated " + context + ":", context );
  }
  
  ,onContextAdapt: function(object)
  {
    if (this.defaultContext.adaptedObjects.containsKey(object))
    {
      console.log( "Default context already has an adaptation for object:", object );
    } 
    else  
        {
          this.defaultContext.adapt( object, Trait(object) );
        }
  }
  
  ,recompose: function(context)
  {
    var self = this;
    
    context.adaptedObjects.each(function (object) {
      var  emptyObject = {}
          ,traits = []
          ,adaptingContexts = []
          ,composedTrait = null
          ,policy = null
          ;
      
      self.activeContexts.each(function (activeContext) {
        if (activeContext.getTrait( object ) !== null) 
        {
          traits.push( activeContext.getTrait(object) );
          adaptingContexts.push( activeContext );
        }
      });
      
      if (traits.length >= 1) 
      {
        copLog( ">>> Started composing object:", object );
        
        composedTrait = copTrait.compose( traits );
        
        if (copTrait.hasConflicts( composedTrait )) 
        {
          console.log( "Conflicts detected on object:", object, "for traits:", traits );
          
          policy = (context instanceof copCombinedContext && context.policy ? context.policy : self.policy);
         
				  composedObject = policy.compose( object, adaptingContexts );
        }
        else 
            {
              composedObject = copTrait.create( emptyObject, composedTrait );
            }
        
        self.restore( object, composedObject );
        
        copLog( "<<< Finished composing object:", object );
      }
      else 
          {
            throw "There should be at least the default trait. No traits found for object:" + object;
          }
    });
  }
  
  ,empty: function( obj ) 
  {
    var name;
    
    for (name in obj) 
    {
      obj[name] = undefined;
      delete obj[name];
    }
  }
  
  ,restore: function( obj, fromObj ) 
  {
    var name;
    
    console.log( 'object to restore', this.clone(obj), 'from', this.clone(fromObj) );
    
    this.empty( obj );
    
    // FIXME: 
    // 1) dependency on jQuery for deep copy of object properties
    // 2) all props are copied in object.. F@#! up original references
    // $.extend( true, obj, fromObj );
    
    for (name in fromObj) 
    {
      if (fromObj.hasOwnProperty(name))
      {
        obj[name] = fromObj[name];
      }
      else
          {
            console.log( "skipped copying property:", name ); 
          }
    }
    
    // FIXME: browser independent feature
    obj.__proto__ = fromObj.__proto__;
     
    console.log( 'object', obj, 'restored from', fromObj );
  }
  
  ,clone: function ( obj )
  {
    return $.extend( true, {}, obj ); 
  }
};
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
 other active contexts, if any, and successively will be applied to the object 
 and make part of its behavior. If there are conflicts and are not resolved by
 *the policy* (??) then an error will be thrown.
 
 */
copContext = function(opt_publicName)
{
  this.id = cop.nextContextId( );
  this.name = opt_publicName || "anonymous_" + this.id;
  
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
      this.active = true;
      this.activationCounter = cop.nextContextActivationCounter( );
      
      // console.log( "Activating " + this.toString() + ":", this );
      
      this.activateEvent.fire( this );
    }
    return this;
  }
  
  ,deactivate: function()
  {
    if (this.active) 
    {
      this.active = false;
      this.activationCounter = null;
      
      // console.log( "Deactivating " + this.toString() + ":", this );
      
      this.deactivateEvent.fire( this );
    }
    return this;
  }
  
  ,adapt: function(var_args)
  {
    var  object = arguments[0]
        ,traits = Array.prototype.slice.call( arguments, 1 )
        ;
    
    console.log( this.toString(), "adapts object:", object, "with traits:", traits );
    
    if (object === null || object === undefined)
    {
       throw "Cannot adapt null or undefined object!";
    }
    if (typeof object !== "object")
    {
       throw "Cannot adapt " + (typeof object) + ". Only objects can be adapted!" ;
    }
    if (Object.isFrozen && Object.isFrozen( object ))
    {
      throw "Cannot adapt frozen object!";
    }
    if (this.adaptedObjects.containsKey(object))
    {
      // Fits need of default context to adapt object just once.
      console.log( "Skipping adaptation! Already has one!" );
      return;
    }

    if (traits.length >= 1) 
    {
      if (traits.length === 1)
      {
        this.setTrait( object, traits[0] );
      }
      else    
          {
            this.setTrait( object, copTrait.compose(traits) );
          }
          
      this.adaptEvent.fire( object );
    }
    
    return this;
  }
  
  ,setTrait: function(object, trait)
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
  
  ,markTrait: function(trait)
  { 
    for (var name in trait) 
    {
      trait[name].context = this;
    }
    return this;
  }
  
  ,getTrait: function(object)
  {
    if (this.adaptedObjects.containsKey( object )) 
    { 
      return this.adaptedObjects.get( object );
    }
    return null;
  }
  
  ,toString: function()
  {
    return "Context" + this.id + (this.name !== "" ? "[\"" + this.name + "\"]" : "");
  }
};
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
        this.active = true;
        this.activationCounter = cop.nextContextActivationCounter( );
        
				console.log( "Activating", this.toString( ) + ":", this );
        
				this.activateEvent.fire( this );
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
        this.active = false;
        this.activationCounter = null;
        
        console.log( "Deactivating", this.toString( ) + ":", this );
        
        this.deactivateEvent.fire( this );
      }
    }
  }
  
  ,toString: function()
  {
    return "CombinedContext" + this.id + "{" + this.subContexts.values() + "}";
  }
});

/**
 copTrait
 ========
 
 Handles the trait composition part for the library. Wraps around the Trait
 object provided by traitsjs library. For more info on traitsjs 
 see: [www.traitsjs.org].
 
 Methods
 -------
 
 - `create(object, trait)`
 
 Returns a `newObject` where the trait is applied on the object. The trait methods
 inside the `newObject` can access the "original" object, which is a reference
 to "object", through `this.original`.
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
    console.log( "FIXME: Trait.create() binds this. " + 
                  "Object.create() does not do that.. but.." +
                  "Look at examples that shows pros/cons"
                );
    
    var composedTrait = Trait.compose( trait, Trait({original: object}) );    
    return Trait.create( object, composedTrait ); // binds This
    
//    return Object.create( object, composedTrait );
  
//    console.log("TODO form here on... ");
//    
//    var obj = Object.create( object, trait );
//  
//    obj.original = object;
//    
//    console.log( "Object created:", obj, "from object:", object, "and trait:", trait );
//         
//    return obj;
  }
  
  ,compose: function(traits) 
  {
  	var composedTrait = Trait.compose2.apply( null, traits );
		
  	console.log( "Composing traits:", traits, "into composed trait:", composedTrait );
    
    return composedTrait;
  }
  
  ,override: function(traits)
  {
    return Trait.override.apply( null, traits );
  }
  
  ,getTraits: function(object, contexts)
  {
    var i, len, t, traits = [];
    
    for (i = 0, len = contexts.length; i < len; i += 1) 
    {
      t = contexts[i].getTrait( object );
      
      if (t) 
      {
        traits.push( t );
      }
    }
    return traits;
  }
  
  ,hasConflicts: function(trait)
  {
    for (var name in trait) 
    {
      if (trait[name].conflict) 
      {
        return true;
      }
    }
    return false;
  }
};
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library

var Trait = (function(){

  // == Ancillary functions ==
  
  var SUPPORTS_DEFINEPROP = (function() {
    try {
      var test = {};
      Object.defineProperty(test, 'x', {get: function() { return 0; } } );
      return test.x === 0;
    } catch(e) {
      return false;
    }
  })();
  
  // IE8 implements Object.defineProperty and Object.getOwnPropertyDescriptor
  // only for DOM objects. These methods don't work on plain objects.
  // Hence, we need a more elaborate feature-test to see whether the
  // browser truly supports these methods:
  function supportsGOPD() {
    try {
      if (Object.getOwnPropertyDescriptor) {
        var test = {x:0};
        return !!Object.getOwnPropertyDescriptor(test,'x');        
      }
    } catch(e) {}
    return false;
  };
  function supportsDP() {
    try {
      if (Object.defineProperty) {
        var test = {};
        Object.defineProperty(test,'x',{value:0});
        return test.x === 0;
      }
    } catch(e) {}
    return false;
  };

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis = Function.prototype.bind ?
    function(fun, self) { return Function.prototype.bind.call(fun, self); } :
    function(fun, self) {
      function funcBound(var_args) {
        return fun.apply(self, arguments);
      }
      return funcBound;
    };

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);
    
  // feature testing such that traits.js runs on both ES3 and ES5
  var forEach = Array.prototype.forEach ?
      bindThis(call, Array.prototype.forEach) :
      function(arr, fun) {
        for (var i = 0, len = arr.length; i < len; i++) { fun(arr[i]); }
      };
  
  var freeze = Object.freeze || function(obj) { return obj; };
  var getPrototypeOf = Object.getPrototypeOf || function(obj) { 
    return Object.prototype;
  };
  var getOwnPropertyNames = Object.getOwnPropertyNames ||
      function(obj) {
        var props = [];
        for (var p in obj) { if (hasOwnProperty(obj,p)) { props.push(p); } }
        return props;
      };
  var getOwnPropertyDescriptor = supportsGOPD() ?
      Object.getOwnPropertyDescriptor :
      function(obj, name) {
        return {
          value: obj[name],
          enumerable: true,
          writable: true,
          configurable: true
        };
      };
  var defineProperty = supportsDP() ? Object.defineProperty :
      function(obj, name, pd) {
        obj[name] = pd.value;
      };
  var defineProperties = Object.defineProperties ||
      function(obj, propMap) {
        for (var name in propMap) {
          if (hasOwnProperty(propMap, name)) {
            defineProperty(obj, name, propMap[name]);
          }
        }
      };
  var Object_create = Object.create ||
      function(proto, propMap) {
        var self;
        function dummy() {};
        dummy.prototype = proto || Object.prototype;
        self = new dummy();
        if (propMap) {
          defineProperties(self, propMap);          
        }
        return self;
      };
  var getOwnProperties = Object.getOwnProperties ||
      function(obj) {
        var map = {};
        forEach(getOwnPropertyNames(obj), function (name) {
          map[name] = getOwnPropertyDescriptor(obj, name);
        });
        return map;
      };
  
  // end of ES3 - ES5 compatibility functions
  
  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeConflictAccessor2(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name+". "+desc);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true
    });
  }
  
  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return freeze({
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true
      }); 
    } else {
      return freeze({
        value: conflict,
        enumerable: false,
        conflict: true
      });
    }
  }
		
	function makeConflictingPropDesc2(name, conflictingContexts) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return {
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true,
			 contexts: conflictingContexts
      }; 
    } else {
      return {
        value: conflict,
        enumerable: false,
        conflict: true,
				contexts: conflictingContexts
      };
    }
  }
  
  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into
  // a conflict) 
  function isSameDesc(desc1, desc2) {
    // for conflicting properties, don't compare values because
    // the conflicting property values are never equal
    if (desc1.conflict && desc2.conflict) {
      return true;
    } else {
      return (   desc1.get === desc2.get
              && desc1.set === desc2.set
              && identical(desc1.value, desc2.value)
              && desc1.enumerable === desc2.enumerable
              && desc1.required === desc2.required
              && desc1.conflict === desc2.conflict); 
    }
  }
  
  function freezeAndBind(meth, self) {
    return freeze(bindThis(meth, self));
  }

  /* makeSet(['foo', ...]) => { foo: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the names array is added to the set.
   *
   * To test whether an element is in the set, perform:
   *   hasOwnProperty(set, element)
   */
  function makeSet(names) {
    var set = {};
    forEach(names, function (name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required
  // property == 
  
  var required = freeze({ 
    toString: function() { return '<Trait.required>'; } 
  });

  // == The public API methods ==

  /**
   * var newTrait = trait({ foo:required, ... })
   *
   * @param object an object record (in principle an object literal)
   * @returns a new trait describing all of the own properties of the object
   *          (both enumerable and non-enumerable)
   *
   * As a general rule, 'trait' should be invoked with an object
   * literal, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are
   * irrelevant.
   * 
   * Data properties bound to function objects in the argument will be
   * flagged as 'method' properties. The prototype of these function
   * objects is frozen.
   * 
   * Data properties bound to the 'required' singleton exported by
   * this module will be marked as 'required' properties.
   *
   * The <tt>trait</tt> function is pure if no other code can witness
   * the side-effects of freezing the prototypes of the methods. If
   * <tt>trait</tt> is invoked with an object literal whose methods
   * are represented as in-place anonymous functions, this should
   * normally be the case.
   */
  function trait(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      } else if (typeof pd.value === 'function') {
        pd.method = true;
        if ('prototype' in pd.value) {
          freeze(pd.value.prototype);
        }
      } else {
        if (pd.get && pd.get.prototype) { freeze(pd.get.prototype); }
        if (pd.set && pd.set.prototype) { freeze(pd.set.prototype); }
      }
      map[name] = pd;
    });
    return map;
  }

  /**
   * var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param trait_i a trait object
   * @returns a new trait containing the combined own properties of
   *          all the trait_i.
   * 
   * If two or more traits have own properties with the same name, the new
   * trait will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(trait_1) returns a trait equivalent to trait_1
   *   compose() returns an empty trait
   */
  function compose(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
            !newTrait[name].required) {
          
          // a non-required property with the same name was previously
          // defined this is not a conflict if pd represents a
          // 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is
   	            // now present 
          }
            
          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as
            // conflicting property
            newTrait[name] = makeConflictingPropDesc(name);
						
          } // else,
          // properties are not in conflict if they refer to the same value
          
        } else {
          newTrait[name] = pd;
        }
      });
    });
    
    return freeze(newTrait);
  }

  function compose2(var_args){
    var traits = slice(arguments, 0);
    var newTrait = {};
    
    forEach(traits, function(trait){
      forEach(getOwnPropertyNames(trait), function(name){
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
        !newTrait[name].required) {
        
          // a non-required property with the same name was previously
          // defined this is not a conflict if pd represents a
          // 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is
            // now present 
          }
          
          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as
            // conflicting property
						
						// Keep track of conflicting contexts
						if (newTrait[name].conflict) {
                newTrait[name].contexts.push(pd.context);
						} else {
							var conflictingContexts = [newTrait[name].context, pd.context];
              newTrait[name] = makeConflictingPropDesc2(name, conflictingContexts);
						}
			
          } // else,
          // properties are not in conflict if they refer to the same value
        }
        else {
          newTrait[name] = pd;
        }
      });
    });
    
    return freeze(newTrait);
  }
  /* var newTrait = exclude(['name', ...], trait)
   *
   * @param names a list of strings denoting property names.
   * @param trait a trait some properties of which should be excluded.
   * @returns a new trait with the same own properties as the original trait,
   *          except that all property names appearing in the first argument
   *          are replaced by required property descriptors.
   *
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, trait) {
    var exclusions = makeSet(names);
    var newTrait = {};
    
    forEach(getOwnPropertyNames(trait), function (name) {
      // required properties are not excluded but ignored
      if (!hasOwnProperty(exclusions, name) || trait[name].required) {
        newTrait[name] = trait[name];
      } else {
        // excluded properties are replaced by required properties
        newTrait[name] = makeRequiredPropDesc(name);
      }
    });
    
    return freeze(newTrait);
  }

  /**
   * var newTrait = override(trait_1, trait_2, ..., trait_N)
   *
   * @returns a new trait with all of the combined properties of the
   *          argument traits.  In contrast to 'compose', 'override'
   *          immediately resolves all conflicts resulting from this
   *          composition by overriding the properties of later
   *          traits. Trait priority is from left to right. I.e. the
   *          properties of the leftmost trait are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent
   *    to override(t2,t1)
   *
   * override() returns an empty trait
   * override(trait_1) returns a trait equivalent to trait_1
   */
  function override(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        // add this trait's property to the composite trait only if
        // - the trait does not yet have this property
        // - or, the trait does have the property, but it's a required property
        if (!hasOwnProperty(newTrait, name) || newTrait[name].required) {
          newTrait[name] = pd;
        }
      });
    });
    return freeze(newTrait);
  }
	  
  /**
   * var newTrait = override(dominantTrait, recessiveTrait)
   *
   * @returns a new trait with all of the properties of dominantTrait
   *          and all of the properties of recessiveTrait not in dominantTrait
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to
   *   override(override(t1, t2), t3) 
   */
  /*function override(frontT, backT) {
    var newTrait = {};
    // first copy all of backT's properties into newTrait
    forEach(getOwnPropertyNames(backT), function (name) {
      newTrait[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newTrait, name))) {
        newTrait[name] = pd; 
      }      
    });
    
    return freeze(newTrait);
  }*/

  /**
   * var newTrait = rename(map, trait)
   *
   * @param map an object whose own properties serve as a mapping from
            old names to new names.
   * @param trait a trait object
   * @returns a new trait with the same properties as the original trait,
   *          except that all properties whose name is an own property
   *          of map will be renamed to map[name], and a 'required' property
   *          for name will be added instead.
   *
   * rename({a: 'b'}, t) eqv compose(exclude(['a'],t),
   *                                 { a: { required: true },
   *                                   b: t[a] })
   *
   * For each renamed property, a required property is generated.  If
   * the map renames two properties to the same name, a conflict is
   * generated.  If the map renames a property to an existing
   * unrenamed property, a conflict is generated.
   *
   * Note: rename(A, rename(B, t)) is equivalent to rename(\n ->
   * A(B(n)), t) Note: rename({...},exclude([...], t)) is not eqv to
   * exclude([...],rename({...}, t))
   */
  function rename(map, trait) {
    var renamedTrait = {};
    forEach(getOwnPropertyNames(trait), function (name) {
      // required props are never renamed
      if (hasOwnProperty(map, name) && !trait[name].required) {
        var alias = map[name]; // alias defined in map
        if (hasOwnProperty(renamedTrait, alias) && 
	    !renamedTrait[alias].required) {
          // could happen if 2 props are mapped to the same alias
          renamedTrait[alias] = makeConflictingPropDesc(alias);
        } else {
          // add the property under an alias
          renamedTrait[alias] = trait[name];
        }
        // add a required property under the original name
        // but only if a property under the original name does not exist
        // such a prop could exist if an earlier prop in the trait was
        // previously aliased to this name
        if (!hasOwnProperty(renamedTrait, name)) {
          renamedTrait[name] = makeRequiredPropDesc(name);     
        }
      } else { // no alias defined
        if (hasOwnProperty(renamedTrait, name)) {
          // could happen if another prop was previously aliased to name
          if (!trait[name].required) {
            renamedTrait[name] = makeConflictingPropDesc(name);            
          }
          // else required property overridden by a previously aliased
          // property and otherwise ignored
        } else {
          renamedTrait[name] = trait[name];
        }
      }
    });
    
    return freeze(renamedTrait);
  }
  
  /**
   * var newTrait = resolve({ oldName: 'newName', excludeName:
   * undefined, ... }, trait)
   *
   * This is a convenience function combining renaming and
   * exclusion. It can be implemented as <tt>rename(map,
   * exclude(exclusions, trait))</tt> where map is the subset of
   * mappings from oldName to newName and exclusions is an array of
   * all the keys that map to undefined (or another falsy value).
   *
   * @param resolutions an object whose own properties serve as a
            mapping from old names to new names, or to undefined if
            the property should be excluded
   * @param trait a trait object
   * @returns a resolved trait with the same own properties as the
   * original trait.
   *
   * In a resolved trait, all own properties whose name is an own property
   * of resolutions will be renamed to resolutions[name] if it is truthy,
   * or their value is changed into a required property descriptor if
   * resolutions[name] is falsy.
   *
   * Note, it's important to _first_ exclude, _then_ rename, since exclude
   * and rename are not associative, for example:
   * rename({a: 'b'}, exclude(['b'], trait({ a:1,b:2 }))) eqv trait({b:1})
   * exclude(['b'], rename({a: 'b'}, trait({ a:1,b:2 }))) eqv
   * trait({b:Trait.required}) 
   *
   * writing resolve({a:'b', b: undefined},trait({a:1,b:2})) makes it
   * clear that what is meant is to simply drop the old 'b' and rename
   * 'a' to 'b'
   */
  function resolve(resolutions, trait) {
    var renames = {};
    var exclusions = [];
    // preprocess renamed and excluded properties
    for (var name in resolutions) {
      if (hasOwnProperty(resolutions, name)) {
        if (resolutions[name]) { // old name -> new name
          renames[name] = resolutions[name];
        } else { // name -> undefined
          exclusions.push(name);
        }
      }
    }
    return rename(renames, exclude(exclusions, trait));
  }

  /**
   * var obj = create(proto, trait)
   *
   * @param proto denotes the prototype of the completed object
   * @param trait a trait object to be turned into a complete object
   * @returns an object with all of the properties described by the trait.
   * @throws 'Missing required property' the trait still contains a
   *         required property.
   * @throws 'Remaining conflicting property' if the trait still
   *         contains a conflicting property. 
   *
   * Trait.create is like Object.create, except that it generates
   * high-integrity or final objects. In addition to creating a new object
   * from a trait, it also ensures that:
   *    - an exception is thrown if 'trait' still contains required properties
   *    - an exception is thrown if 'trait' still contains conflicting
   *      properties 
   *    - the object is and all of its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is bound to the composed object.
   *
   *  Use Object.create instead of Trait.create if you want to create
   *  abstract or malleable objects. Keep in mind that for such objects:
   *    - no exception is thrown if 'trait' still contains required properties
   *      (the properties are simply dropped from the composite object)
   *    - no exception is thrown if 'trait' still contains conflicting
   *      properties (these properties remain as conflicting
   *      properties in the composite object) 
   *    - neither the object nor its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is left unbound.
   */
  function create(proto, trait) {
    var self = Object_create(proto);
    var properties = {};
  
    forEach(getOwnPropertyNames(trait), function (name) {
      var pd = trait[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required) {
        if (!(name in proto)) {
          throw new Error('Missing required property: '+name);
        }
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new Error('Remaining conflicting property: '+name);
      } else if ('value' in pd) { // data property
        // freeze all function properties and their prototype
        if (pd.method) { // the property is meant to be used as a method
          // bind 'this' in trait method to the composite object
          properties[name] = {
            value: freezeAndBind(pd.value, self),
            enumerable: pd.enumerable,
            configurable: pd.configurable,
            writable: pd.writable
          };
        } else {
          properties[name] = pd;
        }
      } else { // accessor property
        properties[name] = {
          get: pd.get ? freezeAndBind(pd.get, self) : undefined,
          set: pd.set ? freezeAndBind(pd.set, self) : undefined,
          enumerable: pd.enumerable,
          configurable: pd.configurable
        };
      }
    });

    defineProperties(self, properties);
    return freeze(self);
  }

  /** A shorthand for create(Object.prototype, trait({...}), options) */
  function object(record, options) {
    return create(Object.prototype, trait(record), options);
  }

  /**
   * Tests whether two traits are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @return a boolean indicating whether the two argument traits are
   *         equivalent.
   */
  function eqv(trait1, trait2) {
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!trait2[name] || !isSameDesc(trait1[name], trait2[name])) {
        return false;
      }
    }
    return true;
  }
  
  // if this code is ran in ES3 without an Object.create function, this
  // library will define it on Object:
  if (!Object.create) {
    Object.create = Object_create;
  }
  // ES5 does not by default provide Object.getOwnProperties
  // if it's not defined, the Traits library defines this utility
  // function on Object 
  if(!Object.getOwnProperties) {
    Object.getOwnProperties = getOwnProperties;
  }
  
  // expose the public API of this module
  function Trait(record) {
    // calling Trait as a function creates a new atomic trait
    return trait(record);
  }
  Trait.required = freeze(required);
  Trait.compose = freeze(compose);
	Trait.compose2 = freeze(compose2);
	Trait.freezeAndBind = freeze(freezeAndBind);
  Trait.resolve = freeze(resolve);
  Trait.override = freeze(override);
  Trait.create = freeze(create);
  Trait.eqv = freeze(eqv);
  Trait.object = freeze(object); // not essential, cf. create + trait
  return freeze(Trait);
  
})();
cop.load()
