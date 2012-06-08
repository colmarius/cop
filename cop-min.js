// Cop.js 0.1.1
//
// (c) 2012 Marius Colacioiu
// Cop library may be freely distributed under Apache 2.0 license.
// For all details and documentation:
// http://colmarius.github.com/cop/
(function(){function l(a){this.values=b.clone(a)||{}}function j(a,c){var d=b.pluck(a,"name");c&&d.sort();return d.join(",")}var i=this,h;h="undefined"!==typeof exports?exports:i.Cop={};h.VERSION="0.1.1";var b=i._;!b&&"undefined"!==typeof require&&(b=require("underscore"));var m=i.Backbone;!m&&"undefined"!==typeof require&&(m=require("backbone"));var k=i.Trait;!k&&"undefined"!==typeof require&&(k=require("traits").Trait);var q=h.Context=function(a){this._configure(a||{})};b.extend(q.prototype,m.Events,
{initialize:function(){},activate:function(){if(!this.active){this.active=true;this.trigger("activate",this)}},deactivate:function(){if(this.active){this.active=false;this.trigger("deactivate",this)}},adapt:function(a,c){if(a===i)throw Error("Cannot adapt the global object.");if(!b.isObject(a))throw Error("Only objects can be adapted.");if(this.getAdaptation(a))throw Error("Object already adapted.");this.adaptations.push({object:a,trait:c});this.trigger("adapt",a)},getAdaptation:function(a){return b.find(this.adaptations,
function(b){return b.object===a})},_configure:function(a){if(!a.name||a.name==="")throw Error("Context object must have a name.");this.active=false;this.adaptations=[];this.name=a.name;if(a.initialize)this.initialize=a.initialize}});h=h.ContextManager=function(a){this._configure(a||{})};b.extend(h.prototype,m.Events,{start:function(){f("Context manager is preparing to start up.");var a=this;this.contexts.registered.each(function(c){f("Initializing context '"+c.name+"'.");c.adaptations.length>0&&b.each(c.adaptations,
function(b){a._onAdapt(b.object)});c.initialize();f("Context '"+c.name+"' is now initialized.")});this.running=true;f("Context manager is now running.");this.contexts.toActivate.length>0&&this.trigger("recompose:start");f("Context manager has started up.")},resolveConflict:function(a,c,d){var e=j(c,true),g=this.resolvedTraits.lookup(e);if(!g){g=[];this.resolvedTraits.store(e,g)}if(b.find(g,function(g){return g.object===a}))throw Error("Object already has resolved trait for contexts: "+e+".");g.push({object:a,
contexts:c,getResolvedTrait:d})},_onAdapt:function(a){b.find(this.originalObjects,function(b){return b.object===a})||this.originalObjects.push({object:a,original:b.clone(a)})},_onContextChange:function(a){f("Context '"+a.name+"' triggered "+(a.active?"activate, marked for activation.":"deactivate, marked for deactivation."));a.active?this.contexts.toActivate.push(a):this.contexts.toDeactivate.push(a);this.running?this.trigger("recompose:start"):f("Context manager not running: context '"+a.name+"' not activated yet.")},
_onRecomposeStart:function(){var a=this.contexts;f("Contexts recomposition started:");f("Contexts active: ["+j(a.active)+"], to activate: ["+j(a.toActivate)+"], to deactivate: ["+j(a.toDeactivate)+"].");this.composer.recompose({contexts:this.contexts,relations:this.relations})},_onRecomposeEnd:function(a){this.contexts=a;f("Contexts recompositon ended!");f("Contexts active: ["+j(a.active)+"], to activate: ["+j(a.toActivate)+"], to deactivate: ["+j(a.toDeactivate)+"].")},_configure:function(a){var c=
new n({contextManager:this}),d=new l,e=new l,g=this;if(!b.isArray(a.contexts)||a.contexts.length==0)throw Error("Cannot create context manager without contexts.");b.each(a.contexts,function(a){if(d.contains(a.name))throw Error("Already registered context: "+a.name+".");d.store(a.name,a);a.on("activate",g._onContextChange,g);a.on("deactivate",g._onContextChange,g);a.on("adapt",g._onAdapt,g)});b.isArray(a.relations)&&a.relations.length>0&&f("TODO: initialize context relations.");this.on("recompose:start",
this._onRecomposeStart,this);this.on("recompose:end",this._onRecomposeEnd,this);this.composer=c;this.contexts={registered:d,active:[],toActivate:[],toDeactivate:[]};this.options=a;this.originalObjects=[];this.relations=e;this.resolvedTraits=new l}});var n=function(a){this._configure(a||{})},o="_super";b.extend(n.prototype,{recompose:function(a){var c,d,e=a.contexts,e=this._resolveDependencies(e,a.relations);f("Contexts with resolved dependencies: ",e);c=this._getAdaptations(e);f("Uncomposed adaptations: ",
c);this._compose(c);f("Composed adaptations: ",c);d=b.filter(c,function(a){return a.hasConflict});if(d.length>0){b.each(d,function(a){var b=j(a.contexts),c=a.errorMessage,a=a.object;f("Contexts ",b,", object: ",a,", conflict: ",c);throw Error("Contexts "+b+" have unresolved conflict for object: "+a+" with error message: "+c);});e=a.contexts}else{f("No conflicts detected.");this._install(c);e={active:b.difference(b.union(e.active,e.toActivate),e.toDeactivate),toActivate:[],toDeactivate:[]}}this.contextManager.trigger("recompose:end",
e)},_resolveDependencies:function(a){f("TODO: resolve context dependencies.");a.active=b.difference(a.active,a.toDeactivate);a.toActivate=b.difference(a.toActivate,a.active);return a},_getAdaptations:function(a){function c(a,c,e){e||(e=false);var f=false;b.each(d,function(b){if(b.object===c.object){f=true;if(e){b.traits.push(c.trait);b.contexts.push(a)}}});!f&&e?d.push({object:c.object,traits:[c.trait],contexts:[a]}):f||d.push({object:c.object,traits:[],contexts:[]})}var d=[];b.each(a.toActivate,
function(a){b.each(a.adaptations,function(b){c(a,b,true)})});b.each(a.toDeactivate,function(a){b.each(a.adaptations,function(b){c(a,b)})});var e=this.contextManager.originalObjects;b.each(d,function(g){b.each(a.active,function(a){var b=a.getAdaptation(g.object);if(b){g.traits.push(b.trait);g.contexts.push(a)}});var c=b.find(e,function(a){return a.object===g.object});g.originalObject=b.clone(c.original)});return d},_compose:function(a){function c(a,c){b.each(a,function(d,e){b.isFunction(d)&&(a[e]=
b.bind(d,c))})}function d(a){var d=j(a.contexts,true),d=e.lookup(d);if(d=b.find(d,function(b){return b.object===a.object})){var f=[];b.each(d.contexts,function(c){c=b.indexOf(a.contexts,c);f.push(a.traits[c])});if(d.getResolvedTrait){d=d.getResolvedTrait.apply(null,f);a.composedTrait=d}else{var h=b.clone(a.originalObject),i=null;c(h,a.object);b.each(f.reverse(),function(a){var b={};b[o]=h;h=i=Object.create(h,k.compose(a,k(b)))});delete a.composedTrait;a.composedObject=i}delete a.hasConflict;delete a.errorMessage}}
var e=this.contextManager.resolvedTraits;b.each(a,function(a){a.composedTrait=k.compose.apply(null,a.traits);try{k.create({},a.composedTrait)}catch(e){a.hasConflict=true;a.errorMessage=e.message}a.hasConflict&&d(a);if(a.hasConflict)f("No resolved trait provided for object: ",a.object," and contexts: ",j(a.contexts));else if(a.composedTrait){var h={},i=b.clone(a.originalObject);c(i,a.object);h[o]=i;h=k.compose(a.composedTrait,k(h));a.composedObject=Object.create(i,h)}})},_install:function(a){function c(a,
c){b.each(b.keys(a),function(b){delete a[b]});b.extend(a,c)}b.each(a,function(a){c(a.object,a.composedObject)})},_configure:function(a){if(!a.contextManager)throw Error("Cannot create composer without a context manager.");this.contextManager=a.contextManager}});b.extend(l.prototype,{store:function(a,b){this.values[a]=b},lookup:function(a){return this.values[a]},contains:function(a){return Object.prototype.hasOwnProperty.call(this.values,a)&&Object.prototype.propertyIsEnumerable.call(this.values,a)},
each:function(a){b.each(this.values,a)}});var p=h.history=[],f=function(){p.push(b.toArray(arguments))};h.showHistory=function(){b.each(p,function(a){console.log(a)})}}).call(this);
