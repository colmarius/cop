$(document).ready(function() {

  module( "copHashSet" );
  
  var value1 = "value1";
  var value2 = "value2";
  var value3 = "value3";
  var value4 = "value4";
  
  var set123 = new copHashSet( );
  var set34 = new copHashSet( );
  
  test( "addAll( values )", function( ) {
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    strictEqual( set123.contains(value1), true, "set123 contains value1" );
    strictEqual( set123.contains(value2), true, "set123 contains value2" );
    strictEqual( set123.contains(value3), true, "set123 contains value3" );
    strictEqual( set123.contains(value4), false, 
                "set123 does not contain value4" );
  });
  
  test( "values( )", function( ) {
    var i, valuesArray = set123.values();
    
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    for (i in valuesArray) {
      strictEqual( set123.contains(valuesArray[i]), true, 
                  "set123 contains " + valuesArray[i] );
    }
  });
  
  test( "remove( value )", function( ) {
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    set34.clear( );
    set34.addAll( [value3, value4] );
    
    set123.remove(value1);
    strictEqual( set123.contains( value1 ), false, 
                "set123 does not contain any more value1" );
		
		set123.remove(value2);
    strictEqual( set123.contains( value2 ), false, 
                "set123 does not contain any more value2" );
		
		set123.remove(value3);
    strictEqual( set123.contains( value3 ), false, 
                "set123 does not contain any more value3" );
		
    strictEqual( set123.isEmpty( ), true, 
                "set123 now is empty" );
  });
  
  test( "contains( value )", function( ) {
    set123.clear();
    set123.addAll([value1, value2, value3]);
    
    set34.clear();
    set34.addAll([value3, value4]);
    
    strictEqual( set123.contains(value1), true, "set123 contains value1" );
    strictEqual( set123.contains(value2), true, "set123 contains value2" );
    strictEqual( set123.contains(value3), true, "set123 contains value3" );
    strictEqual( set123.contains(value4), false, 
                "set123 does not contain value4" );
    strictEqual( set34.contains(value1), false, 
                "set34 does not contain value1" );
    strictEqual( set34.contains(value2), false, 
                "set34 does not contain value2" );
    strictEqual( set34.contains(value3), true, "set34 contains value3" );
    strictEqual( set34.contains(value4), true, "set34 contains value4" );
  });
  
  test( "clear( )", function( ) {
    set123.addAll( [value1, value2, value3] );
    set123.clear( );
    
    strictEqual( set123.isEmpty(), true, "set123 is empty" );
  });
  
  test( "size( )", function( ) {
    set123.clear( );
    
    set123.addAll( [value1, value2, value3] );
    set123.addAll( [value1, value2, value3] );
    
    equal( set123.size(), 3, "set123 has size 3" );
    
    set34.clear( );
    set34.addAll( [value3, value4] );
    
    equal( set34.size(), 2, "set34 has size 2" );
  });
  
  test( "isEmpty( )", function( ) {
    set123.clear();
    
    strictEqual( set123.isEmpty(), true, "set123 is empty" );
    
    set123.addAll( [value1, value2, value3] );
    set123.addAll( [value1, value2, value3] );
    
    strictEqual( set123.isEmpty(), false, "set123 is not empty" );
    
    set123.clear();
    
    strictEqual( set123.isEmpty(), true, "set123 is empty" );
  });
	
  test( "each( callback )", function( ) {
    var newSet = new copHashSet( );
    
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
		
		set123.each( function( value ) {
			newSet.add( value );
		});
    
		strictEqual( newSet.size(), 3, "newSet has size 3" );
		
    strictEqual( newSet.isSubsetOf(set123), true, 
                "newSet is subset of set123" );
  });
  
  test( "clone( )", function( ) {
    var set123Clone;
    
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    set123Clone = set123.clone( );
    
    strictEqual( set123Clone.isSubsetOf( set123Clone ), true, 
                "set123Clone is subset of set123Clone" );
    strictEqual( set123Clone.isSubsetOf( set123 ), true, 
                "set123Clone is subset of set123" );
    strictEqual( set123.isSubsetOf( set123Clone ), true, 
                "set123 is subset of set123Clone" );
  });

  test( "intersection( set )", function( ) {
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    set34.clear( );
    set34.addAll( [value3, value4] );
    
    var set3 = set123.intersection( set34 );
    
    strictEqual( set3.contains(value1), false, "set3 does not contain value1" );
    strictEqual( set3.contains(value2), false, "set3 does not contain value2" );
    strictEqual( set3.contains(value3), true, "set3 contains value3" );
    strictEqual( set3.contains(value4), false, "set3 does not contain value4" );
  });
  
  test( "union( set )", function( ) {
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    set34.clear( );
    set34.addAll( [value3, value4] );
    
    var set1234 = set123.union( set34 );
    
    strictEqual( set1234.contains( value1 ), true, "set1234 contains value1" );
    strictEqual( set1234.contains( value2 ), true, "set1234 contains value2" );
    strictEqual( set1234.contains( value3 ), true, "set1234 contains value3" );
    strictEqual( set1234.contains( value4 ), true, "set1234 contains value4" );
  });
  
  test( "isSubsetOf( set )", function( ) {
    var set123Clone;
    
    set123.clear( );
    set123.addAll( [value1, value2, value3] );
    
    set123Clone = set123.clone( );
    
    set34.clear( );
    set34.addAll( [value3, value4] );
    
    strictEqual( set123Clone.isSubsetOf( set123Clone ), true, 
                "set123Clone is subset of set123Clone" );
    strictEqual( set123Clone.isSubsetOf( set123 ), true, 
                "set123Clone is subset of set123" );
    strictEqual( set123.isSubsetOf( set123Clone ), true, 
                "set123 is subset of set123Clone" );
    strictEqual( set34.isSubsetOf( set123 ), false, 
                "set34 is not subset of set123" );
  });
  
});

