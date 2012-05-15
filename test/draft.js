var batteryLevel = 10;
var connectedToInternet = false;

var MYAPP = {
  initScreen: function() {
    console.log("MYAPP initialized normally.");
  }
};

var offline = new Cop.Context({
  name: 'offline',
  initialize: function() {
    if (connectedToInternet == false) this.activate();
  }
});

var batteryLow = new Cop.Context({
	name: 'batteryLow',
  initialize: function() {
    if (batteryLevel <= 30) this.activate();
  }
});

// Real world example (using Phonegap API):
// var batteryLow = new Cop.Context({
//   name: 'batteryLow',
//   initialize: function() {
//     window.addEventListener("batterylow", onBatteryLow, false);
//     function onBatteryLow(info) {
//       if (info.level <= 30) this.activate();
//       else this.deactivate();
//     }
//   }
// });

var cm = new Cop.ContextManager({
  contexts: [batteryLow, offline],
  relations: {
    exclusions: [[batteryLow, offline]],
    inclusions: [],
    suggestions: [],
    requirements: []
  }
});

batteryLow.adapt(MYAPP, Trait({
  initScreen: function() {
    //this._super.initScreen();
    console.log("MYAPP running with low battery.")
  }
}));

offline.adapt(MYAPP, Trait({
  initScreen: function() {
    console.log("MYAPP running with no internet connection.");
  }
}));

// cm.resolveConflict({
//   object: MYAPP,
//   contexts: [batteryLow, offline],
//   getResolvedTrait: function(batteryLowT, offlineT) {
//     var batteryLowAliased = Trait.resolve({initScreen: 'initScreenBatteryLow'}, batteryLowT);
//     var offlineAliased = Trait.resolve({initScreen: 'initScreenOffline'}, offlineT);
//     return Trait.compose(batteryLowAliased, offlineAliased, Trait{
//       initScreen: function() {
//         console.log("MYAPP running offline with battery low.");
//         this.initScreenBatteryLow();
//         this.initScreenOffline();
//       }
//     });
//   }
// });

cm.start(); // now contexts are initialized and objects are composed accordingly

MYAPP.initScreen();

showHistory();