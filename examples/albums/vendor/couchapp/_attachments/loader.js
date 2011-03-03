
function couchapp_load(scripts) {
  for (var i=0; i < scripts.length; i++) {
    document.write('<script src="'+scripts[i]+'"><\/script>')
  };
};

couchapp_load([
  "/_utils/script/sha1.js",
  "/_utils/script/json2.js",
  "vendor/couchapp/jquery-1.4.4.min.js",
  "/_utils/script/jquery.couch.js",
  "vendor/couchapp/jquery.couch.app.js",
  "vendor/couchapp/jquery.couch.app.util.js",
  "vendor/couchapp/jquery.mustache.js",
  "vendor/couchapp/jquery.evently.js",
  "vendor/couchapp/jquery.mobile-1.0a3.js",
  "vendor/couchapp/cop.js"
]);
