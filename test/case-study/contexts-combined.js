/**
	Specific to Star and Line Log contexts  
 */
var ctxStarAndLineLog = new copCombinedContext(null, ctxLineLog, ctxStarLog);

ctxStarAndLineLog.adapt(logger, Trait({
  log: function(msg){
    return "(*-)" + msg;
  }
}));

/**
	Specific to Line and Location Log contexts  
 */
var ctxLineAndLocationLog = new copCombinedContext(null, ctxLineLog, ctxLocationLog);

ctxLineAndLocationLog.adapt(logger, Trait({
  log: function(msg){
    return "(-[ucl])" + msg;
  }
}));