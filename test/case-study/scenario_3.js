/**
 Scenario 3
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest

  var unit = makeUnitTest('Logger - Scenario 3', false);
  var compare = unit.compare;
	
  var msg = "message to log";
  
  // == the unit tests ==
  
	load('logger.js');
  load('contexts.js');
  
  compare(msg, logger.log(msg), "before any ctx activation: got normal logged msg");
  
  ctxLineLog.activate();
  
  compare("-" + msg + "-", logger.log(msg), "after ctxLineLog is active: got line decorated logged msg");
	
  ctxStarLog.activate();
  
  compare("-*" + msg + "*-", logger.log(msg), "after ctxLineLog and ctxStarLog are active: got first star, then line decorated logged msg");
  
  ctxStarLog.deactivate();
  
  compare("-" + msg + "-", logger.log(msg), "after ctxStarLog is deactived: got line decorated logged msg");
  
  ctxLineLog.deactivate();
  
  compare(msg, logger.log(msg), "after ctxLineLog is deactived: got normal logged msg");

  return unit.testDone();
  
}());
