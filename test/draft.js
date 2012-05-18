var batteryLevel = 10;
var connectedToInternet = false;
var gpsAvailable = true;

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

var noGPS = new Cop.Context({
  name: 'noGPS',
  initialize: function() {
    if (gpsAvailable === false) this.activate();
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
  contexts: [batteryLow, offline, noGPS],
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

noGPS.adapt(MYAPP, Trait({
  initScreen: function() {
    console.log("MYAPP running with no GPS.");
  }
}));

cm.resolveConflict(MYAPP, [offline, batteryLow], function(offlineT, batteryLowT) {
  return Trait.compose(
    Trait.resolve({initScreen: 'initScreenBatteryLow'}, batteryLowT), 
    Trait.resolve({initScreen: 'initScreenOffline'}, offlineT),
    Trait({
      initScreen: function() {
        console.log("MYAPP running 'offline' with 'battery low'.");
        this.initScreenOffline();
        this.initScreenBatteryLow();
      }
    })
  );
});

cm.resolveConflict(MYAPP, [offline, noGPS, batteryLow], function(offlineT, noGPST, batteryLowT) {
  return Trait.compose(
    Trait.resolve({initScreen: 'initScreenNoGPS'}, noGPST), 
    Trait.resolve({initScreen: 'initScreenOffline'}, offlineT),
    Trait.resolve({initScreen: 'initScreenBatteryLow'}, batteryLowT), 
    Trait({
      initScreen: function() {
        console.log("MYAPP running 'offline', with 'battery low', and 'no GPS'.");
        this.initScreenBatteryLow();
        this.initScreenNoGPS();
        this.initScreenOffline();
      }
    })
  );
});

cm.start(); // now contexts are initialized and objects are composed accordingly

MYAPP.initScreen();

Cop.ContextManager.showHistory();