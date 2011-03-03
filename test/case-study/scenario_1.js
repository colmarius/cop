/**
 Scenario 1
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest
	
  var unit = makeUnitTest('Logger - Scenario 1', false);
  var compare = unit.compare;
	
  var msg = "message to log";
  
  // == the unit tests ==
  load('logger.js');
  load('contexts.js');
  
  compare(msg, logger.log(msg), "before ctx activation: got normal logged msg");
  
  ctxStarLog.activate();
  
  compare("*" + msg + "*", logger.log(msg), "ctx active: got star logged msg");
  
  ctxStarLog.deactivate();
  
  compare(msg, logger.log(msg), "after ctx deactivation: got normal logged msg");
  
  return unit.testDone();
  
}());
