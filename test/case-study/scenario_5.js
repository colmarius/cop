/**
 Scenario 5
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest
  
  var unit = makeUnitTest('Logger - Scenario 5', false);
  var compare = unit.compare;
  
  var msg = "message to log";
  
  // == the unit tests ==
  
	load('logger.js');
  load('contexts.js');
	load('contexts-combined.js');
  
  ctxStarLog.activate();
  ctxLineLog.activate();
  ctxLocationLog.activate();
  
  compare("(-[ucl])" + msg, logger.log(msg), "after ctxLineLog, ctxStarLog and ctxLocationLog are active: most recently combined context should be active");
  
  ctxLineLog.deactivate();
  
  compare("*" + "[ucl]" + msg + "*", logger.log(msg), "after ctxLineLog is deactived: got normal logged msg");
	
	ctxStarLog.deactivate();
  ctxLineLog.deactivate();
	
	// -----------------------
	
  ctxLocationLog.activate();
  ctxLineLog.activate();
	ctxStarLog.activate();
	
	compare("(*-)" + msg, logger.log(msg), "after ctxLineLog, ctxStarLog and ctxLocationLog are active: most recently combined context should be active");
  
	ctxLineLog.deactivate();
	ctxStarLog.deactivate();
  ctxLineLog.deactivate();
  
	// -----------------------
	
  return unit.testDone();
  
}());
