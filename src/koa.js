var EventEmitter = require('events').EventEmitter;
var _id = 0;

function Koa(){
	this._mwFnMap = [];
}

function Worker(gen){
	this.g = gen;
	this.busy = false;
	this.ctx = null;
	this._id = 0;
}

Worker.prototype = Object.create(new EventEmitter());

function Request(){
	this.query = {};
	this.body = {};
}

Request.prototype = {
	
}

function Response(){
	this.body = {};
}

Response.prototype = {
	write: function(str){
		console.log("res is write---" + str);
	},
	end: function(){
		console.log("res is end---" + str);
	}
}

Koa.prototype.use = function(fn){
	this._mwFnMap[_id++] = fn;
}

var workersQueue = [];
//control the flow
function _rigistryWorker(mwFnMap, req, res, next){
	var worker = new Worker();
	for(var i = 0, len = mwFnMap.length; i < len; i++){
		var g = function(){
			return mwFnMap[i].call(null, req, res, next)
		}();
		var worker = new Worker(g);
		worker._id = i;
		workersQueue.push(worker);
	}	
}
Koa.prototype.start = function(){
	var req = new Request();
	var res = new Response();
	var next = "next";
	var index = 0;

	_rigistryWorker(this._mwFnMap, req, res, next);

	var w = workersQueue[index];
	function recur(w, data){
		var result = w.g.next(data);
		if(result.done){
			var prevworker = workersQueue[--index];
			if(prevworker){
				recur(prevworker);
			}
			return;
		};
		if(result.value == "next"){
			w.busy = true;
			w.emit('continue');
			var nextworker = workersQueue[++index];
			if(nextworker){
				recur(nextworker);
			}
		} 
		if(!(w.busy)){
			result.value(function(err, data) {
				recur(w, data);
			});
		}else{
			w.once('continue', function(){
				w.busy = !(w.busy);
				recur(w, data);
			})
		}
	}
	recur(w);
}

module.exports = new Koa();