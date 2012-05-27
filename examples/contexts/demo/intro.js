var batteryLevel = 100;
var connectedToInternet = true;
var gpsAvailable = true;

var MYAPP = {
  initScreen: function() {
    print("MYAPP initialized normally.");
  }
};

var batteryLow = new Cop.Context({
  name: 'batteryLow',
  initialize: function() {
    if (batteryLevel <= 30) this.activate();
  }
});

var offline = new Cop.Context({
  name: 'offline',
  initialize: function() {
    if (connectedToInternet == false) this.activate();
  }
});

var noGPS = new Cop.Context({
  name: 'noGPS',
  initialize: function() {
    if (gpsAvailable === false) this.activate();
  }
});

var cm = new Cop.ContextManager({
  contexts: [batteryLow, offline, noGPS],
  relations: {}
});

batteryLow.adapt(MYAPP, Trait({
  initScreen: function() {
    //this._super.initScreen();
    print("MYAPP running with low battery.")
  }
}));

offline.adapt(MYAPP, Trait({
  initScreen: function() {
    print("MYAPP running with no internet connection.");
  }
}));

noGPS.adapt(MYAPP, Trait({
  initScreen: function() {
    print("MYAPP running with no GPS.");
  }
}));

cm.resolveConflict(MYAPP, [offline, batteryLow], function(offlineT, batteryLowT) {
  return Trait.compose(
    Trait.resolve({initScreen: 'initScreenBatteryLow'}, batteryLowT), 
    Trait.resolve({initScreen: 'initScreenOffline'}, offlineT),
    Trait({
      initScreen: function() {
        print("MYAPP running 'offline' with 'battery low'.");
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
        print("MYAPP running 'offline', with 'battery low', and 'no GPS'.");
        this.initScreenBatteryLow();
        this.initScreenNoGPS();
        this.initScreenOffline();
      }
    })
  );
});

try {
  cm.start(); // now contexts are initialized and objects are composed accordingly
}
catch (err) {
  print("Error: " + err.message + "\n"); 
}

MYAPP.initScreen();