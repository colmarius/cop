/**
 Scenario 4
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest
  
  var unit = makeUnitTest('Logger - Scenario 4', false);
  var compare = unit.compare;
	
  var msg = "message to log";
  
  // == the unit tests ==
  
	load('logger.js');
  load('contexts.js');
	load('contexts-combined.js');

  ctxLineLog.activate();
  ctxStarLog.activate();
  
  compare("(*-)" + msg, logger.log(msg), "after ctxLineLog and ctxStarLog are active, combined context ctxStarAndLineLog becomes active: ...");
  
  ctxStarLog.deactivate();
  
  compare("-" + msg + "-", logger.log(msg), "after ctxStarLog is deactived: got line decorated logged msg");
  
  ctxLineLog.deactivate();
  
  compare(msg, logger.log(msg), "after ctxLineLog is deactived: got normal logged msg");
  
  return unit.testDone();
  
}());
