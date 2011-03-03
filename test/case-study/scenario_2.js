/**
 Scenario 2
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest

  var unit = makeUnitTest('Logger - Scenario 2', false);
  var compare = unit.compare;
	
  var msg = "message to log";
  
  // == the unit tests ==
  
	load('logger.js');
  load('contexts.js');
  
  compare(msg, logger.log(msg), "before any ctx activation: got normal logged msg");
  
  ctxStarLog.activate();
  
  compare("*" + msg + "*", logger.log(msg), "after ctxStarLog is active: got star decorated logged msg");
  
  ctxLineLog.activate();
  
  compare("*-" + msg + "-*", logger.log(msg), "after ctxStarLog and ctxLineLog are active: got first line, then star decorated logged msg");
  
  ctxStarLog.deactivate();
  
  compare("-" + msg + "-", logger.log(msg), "after ctxStarLog is deactived: got line decorated logged msg");
  
  ctxLineLog.deactivate();
  
  compare(msg, logger.log(msg), "after ctxLineLog is deactived: got normal logged msg");

  return unit.testDone();
  
}());
