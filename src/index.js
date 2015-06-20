var app = require('./koa');
var fs = require('fs');
var thunkify = require('./thunkify');
var readFile = thunkify(fs.readFile);

app.use(function* (req, res, next){
	console.log("middleware1 dosomething----");
	var file = yield readFile('./test.html');
	console.log("middleware1 file is loaded, content is----" + file);
	yield next;
	console.log("middleware1 reload");
});

app.use(function* (req, res, next){
	console.log("middleware2 dosomething----");
	var file = yield readFile('./test.html');
	console.log("middleware2 file is loaded, content is----" + file);
	console.log("middleware2 reload");
});


app.start();