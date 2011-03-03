function (doc, req)
{
  var Mustache = require("vendor/couchapp/lib/mustache");
  var stash = {
     artist: doc.artist
    ,title: doc.title
    ,document: doc._id
  };
  return Mustache.to_html( this.templates.albumdelete, stash, this.templates.partials.albumdelete );
}