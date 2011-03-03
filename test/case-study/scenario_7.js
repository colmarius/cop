/**
 Scenario 7
 ==========
 
 
 */
(function(){

  load('../../cop.js'); // provides cop
  load('unit.js'); // provides makeUnitTest

  var unit = makeUnitTest('Logger - Scenario 7', false);
  var compare = unit.compare;
  
  var msg = "message to log";
  
  // == the unit tests ==
  
  load('logger.js');
  load('contexts.js');
  load('contexts-combined.js');
  
  var policyLineStarLoc = new copPolicy();
  
  policyLineStarLoc.order = function(contexts){
    return [ctxLineLog, copContextRegistry.retrieve("Default")];
  };
  
  var ctxLineStarLocationLog = new copCombinedContext(policyLineStarLoc, ctxLineLog, ctxStarLog, ctxLocationLog);
  
  ctxLineStarLocationLog.adapt(logger, Trait({})); // (!)
  
  ctxStarLog.activate();
  ctxLineLog.activate();
  ctxLocationLog.activate();
  
  compare("-" + msg + "-", logger.log(msg), "after ctxLineLog, ctxStarLog and ctxLocationLog are active: using custom policy, preference to ctxLineLog");
  
	// ------------------------
	
  ctxLineStarLocationLog.policy.order = function(contexts){
    return [ctxStarLog, copContextRegistry.retrieve("Default")];
  };
	
	ctxStarLog.deactivate();
	
	ctxStarLog.activate();
	
  compare("*" + msg + "*", logger.log(msg), "after ctxLineLog, ctxStarLog and ctxLocationLog are active: using custom policy, preference to ctxStarLog");
	
  return unit.testDone();
  
}());
