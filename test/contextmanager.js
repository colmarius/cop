$(document).ready(function() {

  module("copContextManager");
  
  test( "empty: object", function( ) {    
    var previous,
        object = { 
          a:1,
          b:2,
          foo: function() {},
          bar: function() {}
        };    
    previous = object;
    copContextManager.empty( object );    
    ok( previous === object, "Object reference is maintained" );
    ok( !object.a, "Object should not have 'a' property" );
    ok( !object.b, "Object should not have 'b' property" );
    ok( !object.foo, "Object should not have 'foo' property" );
    ok( !object.bar, "Object should not have 'bar' property" );
  });

  test( "restore: object without prototype from object without prototype", function( ) {
    var previous,
        object = { 
          a:1, 
          b:2, 
          foo: function() {}, 
          bar: function() {} 
        },
        fromObject = { 
          m: function() {} 
        };
    previous = object;
    copContextManager.restore( object, fromObject );    
    ok( previous === object, "Object reference is maintained" );
    ok( !object.a, "Object should not have 'a' property" );
    ok( !object.b, "Object should not have 'b' property" );
    ok( !object.foo, "Object should not have 'foo' property" );
    ok( !object.bar, "Object should not have 'bar' property" );
    ok( object.m, "Object should have 'm' property" );
    ok( object.m === fromObject.m, "Object 'm' property is consistent" );
  });
  
  test( "restore: object with prototype from object with prototype", function( ) {    
    var object = { 
          a:1, 
          b:2, 
          foo: function() {}, 
          bar: function() {} 
        }, 
        objectPrototype = object.__proto__ = {
          objProto: function() {} 
        }, 
        fromObject = {
          m: function() {}
        }, 
        fromObjectPrototype = fromObject.__proto__ = {
          fromObjProto: function() {}
        };
    previous = object;
    copContextManager.restore( object, fromObject );
    ok( previous === object, "Object reference is maintained" );
    ok( !object.a, "Object should not have 'a' property" );
    ok( !object.b, "Object should not have 'b' property" );
    ok( !object.foo, "Object should not have 'foo' property" );
    ok( !object.bar, "Object should not have 'bar' property" );
    ok( object.__proto__ !== objectPrototype, 
        "Object prototype should not be the old one" );
    ok( !object.objProto, "Object should not have 'objProto' property" );
    ok( object.m, "Object should have 'm' property" );
    ok( object.m === fromObject.m, "Object 'm' property is consistent" );  
    ok( object.__proto__ === fromObjectPrototype, 
        "Object prototype should be from the restored object " );
    ok( object.fromObjProto, "Object should have 'fromObjProto' property" );
    
    ok( false, 
        "FIXME: Dependency on __proto__. Is it browser specific? (FF/Chrome)" );
  });
  
  
  test( "initialize", function( ) {
    if( copContextManager.defaultContext === null ) {
      copContextManager.initialize( );
    }
    ok( copContextManager.defaultContext, "Default context exists" );
    ok( copContextManager.defaultContext.active, "Default context is active" );
    equal( copContextManager.defaultContext.name, "Default", 
          "Default context name is 'Default'" );
  });
  
  // install
  // register
  
  // onContextActivate
  // onContextDeactivate
  // onContextAdapt
  // recompose


});
