module.exports = function thunkify(fn){
	return function(){
		var args = [].slice.call(arguments);
			return function(callback){
				args.push(callback);
				return fn.apply(this, args);
		}
	}
}