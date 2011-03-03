/**
 
 */

var policy = new copPolicy();

policy.order = function( contexts ) {  
  var idxProf = contexts.indexOf( Profiler ),
      idxDefProg = contexts.indexOf( DefensiveProgramming ),
      ret = contexts.splice( 0 ), temp;
      
  if( (idxProf >=0) // Is Profiler?
      && (idxDefProg >= 0) // Is DefensiveProgramming?
      && (idxDefProg > idxProf) // DefensiveProgramming comes after Profiler?
    ) { 
      // Swap them.
      temp = ret[idxProf];
      ret[idxProf] = ret[idxDefProg];
      ret[idxDefProg] = temp;
  }
    
  console.log( "ProfilerDefProg Policy ordered contexts: ", ret.join(",") );
  return ret;
}

var ProfilerDefProg = new copCombinedContext( policy, Profiler, DefensiveProgramming );
