/**
  "Defensive programming is a form of defensive design intended to ensure the 
  continuing function of a piece of software in spite of unforeseeable usage of 
  said software." [Wikipedia]
  
  Essentially with defensive programming your aim is to make the software 
  behave in a predictable manner despite unexpected inputs or user actions.
  
  So, you test passed parameters to functions, by checking if they have the 
  expected values, failing otherwise. Code is added and the program grows.
  
  It should also maintain the source code comprehensible; one might want to 
  keep it readable and maintainable.
  
  My idea is that readibility and maintainability is improved by clearly 
  modularizing the code and having less code to read and understand.
  
  So why not take the concept of "defensive programming" and threat it as a 
  context. We can use it then as a module where we can put all the testing for 
  improper parameter passing to functions.
  
  First we will identify the objects on which we want to use "defensive 
  programming". We will take as example the `logger` object, as we are 
  interested in the `log` function.
  
  By using context-oriented programming we first create our 
  "DefensiveProgramming" context. Then we say we declare the `logger` object to 
  have a different `log` method implementation under this context. Here is 
  where we check our log method parameters. So what we are testing is that the 
  "msg" parameter is a string, as we want our logger to print only string 
  messages. 
  
  So how do we declare that the `logger` object as having a new `log` method 
  under the `DefensiveProgramming` context?
  Simple, by registering an adaptation request to the context. We call the 
  `adapt` method on our context, method which all context objects have. We pass
  as first parameter the logger object. The second parameter passed is the 
  trait which contains the new log method with the logic for testing the passed 
  parameters. If all checks pass then the original log method is called
  as intended to preserve the original logger behaviour.
  
  So what we can do with context-oriented programming is to separate the logic
  of defensivly testing our code from its main logic. The context of "defensive
  programming" can be activated during the tests for the application. Then,
  if the log method will be called withoud respecting the msg parameter as
  being a string it will fail by throwing an error. If all tests pass
  and no error is thrown then the DefensiveProgramming context can be ignored
  in the application, by not activating it.
  
  So how do we make our DefensiveProgramming make part of our application?
  We do this by activating it by calling the `activate()` method on the context.
  Calling the `deactivate()` method of the DefensiveProgramming context removes
  from the application any changes made by the context.

  ...
  
 */

var DefensiveProgramming = new copContext( "DefensiveProgramming" );

DefensiveProgramming.adapt( logger, Trait({
  log: function( msg ) {
    if( typeof msg !== "string" ) {
      throw 'In "logger.log" parameter "msg" is ' + (typeof msg) + 
            ' it should be string';
    } else {
      this.original.log( msg );
    }
  }
}));

DefensiveProgramming.adapt( test, Trait({
  foo: function( ) {
    return "DefensiveProgramming version";
  }
}));