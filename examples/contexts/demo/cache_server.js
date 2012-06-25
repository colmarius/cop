var cacheServer = {
  values: {},
  store: function(key, value) {
    this.values[key] = value;
  },
  lookup: function(key) {
    return this.values[key];
  },
  remove: function(key) {
    delete this.values[key];
  }
};

Backup  = new Cop.Context({name: 'Backup'});
Privacy = new Cop.Context({name: 'Privacy'});
Debug   = new Cop.Context({name: 'Debug'});

Backup.adapt(cacheServer, Trait({
  backupValues: {},
  store: function(key, value) {
    print("Backup:  cacheServer.backupValues[" + key + "] = " + value);
    this.backupValues[key] = value;
    this._super.store(key, value);
  },
  backupLookup: function(key) {
    var value = this.backupValues[key];
    print("Backup:  cacheServer.backupLookup(" + key + ") returned " + value);
    return value;
  }
}));

Privacy.adapt(cacheServer, Trait({
  encrypt: function(value) {
    return "&&" + value + "%%";
  },
  decrypt: function(value) {
    return value.slice(2, value.length - 2);
  },
  store: function(key, value) {
    var encryptedValue = this.encrypt(value);
    print("Privacy: cacheServer.store(" + key + ", " + encryptedValue + ")");
    this._super.store(key, encryptedValue);
  },
  lookup: function(key) {
    var encryptedValue = this._super.lookup(key);
    if (encryptedValue) {
      print("Privacy: cacheServer.lookup(" + key + ") returned " + encryptedValue);
      var decryptedValue = this.decrypt(encryptedValue);
      return decryptedValue;  
    }
  }
}));

Debug.adapt(cacheServer, Trait({
  store: function(key, value) {
    print("Debug:   cacheServer.store(" + key + ", " + value + ")");
    this._super.store(key, value);
  },
  lookup: function(key) {
    var value = this._super.lookup(key);
    print("Debug:   cacheServer.lookup(" + key + ") returned " + value);
    return value;
  },
  remove: function(key) {
    print("Debug:   cacheServer.remove(" + key + ")");
    this._super.remove(key);
  }
}));

Backup.on("activate", function() {
  for (var key in cacheServer.values) {
    if (cacheServer.backupValues[key] === undefined)
      cacheServer.backupValues[key] = cacheServer.values[key];
  }
});

var contextManager = new Cop.ContextManager({
  contexts: [Backup, Privacy, Debug]
});

contextManager.resolveConflict(cacheServer, [Debug, Privacy], 
  function(debugT, privacyT) {
    return Trait.compose(
      privacyT,
      Trait.resolve({
        store: undefined,
        lookup: undefined
      }, debugT));
});
contextManager.resolveConflict(cacheServer, [Debug, Backup]);
contextManager.resolveConflict(cacheServer, [Backup, Privacy],
  function(backupT, privacyT) {
    return privacyT;
});
contextManager.resolveConflict(cacheServer, [Debug, Backup, Privacy]);

contextManager.start();

Debug.activate();
Privacy.activate();
Backup.activate();

cacheServer.store("1", 1);
cacheServer.lookup("1");
cacheServer.remove("1");