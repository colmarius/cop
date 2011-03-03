/**
  Context Star Decorated Logger
 */
var ctxStarLog = new copContext("StarDecoratedLogger");

ctxStarLog.adapt(logger, Trait({
  log: function(msg){
    return this.original.log("*" + msg + "*");
  }
}));

/**
	Context Line Decorated Logger  
 */
var ctxLineLog = new copContext("LineDecoratedLogger");

ctxLineLog.adapt(logger, Trait({
  log: function(msg){
    return this.original.log("-" + msg + "-");
  }
}));

/**
	Context Location Decorated Logger  
 */
var ctxLocationLog = new copContext("LocationDecoratedLogger");

ctxLocationLog.adapt(logger, Trait({
  log: function(msg){
    return this.original.log("[ucl]" + msg);
  }
}));

