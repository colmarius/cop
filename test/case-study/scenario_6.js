/**
 Scenario 6
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest
  
  var unit = makeUnitTest('Logger - Scenario 6', false);
  var compare = unit.compare;
  
  var msg = "message to log";
  
  // == the unit tests ==
  
  load('logger.js');
  load('contexts.js');
  load('contexts-combined.js');
	
  var ctxLineStarLocationLog = new copCombinedContext(null, ctxLineLog, ctxStarLog, ctxLocationLog);
  
  ctxLineStarLocationLog.adapt(logger, Trait({
    log: function(msg){
      return "(-*[ucl])" + msg;
    }
  }));
  
  ctxStarLog.activate();
  ctxLineLog.activate();
  ctxLocationLog.activate();
  
  compare("(-*[ucl])" + msg, logger.log(msg), "after ctxLineLog, ctxStarLog and ctxLocationLog are active: most recently combined context should be active");
  
  return unit.testDone();
  
}());
