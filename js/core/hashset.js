/**
 copHashSet
 ==========
 
 Based on `copHashtable`.
 
 See
 ---
 
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

