//= require modules/sand.min
//= require_tree modules
var http = require('http'), fs = require('fs');

var serveur =  http.createServer(function (req,res) {
	if (req.url === '/') {
		res.writeHead(200);
		res.end('Hello');
	} /*else if (req.url === "/upload"){	
		console.log("/upload");
		var data = "";
		req.on("data", function (d) {
			data += d;
		})

		req.on("end", function () {
			console.log(decodeURIComponent(data).slice(0,50));
			console.log(new Buffer(decodeURIComponent(data),'base64'));
			fs.writeFile("img/uploads/cool.png",new Buffer(decodeURIComponent(data).split(",")[1],'base64'),function (err) {
  			if (err) throw err;
  			console.log('It\'s saved!');
			})
		})
	}*/
	else if (req.url.split(".")[1] === 'html') {
		res.writeHead(200);
		fs.readFile("." + req.url.split(".")[0] + ".html", function (err, data) {
			if (err) throw err;
			if(req.url.split(".")[0] === "/droppableCase"){	
				data = data.toString();
				data = data.split('<body>');
				var scripts = "";

				var snockets =  new (require('snockets'));
				console.log(snockets.scan);
				snockets.scan('server.js',{async: true },function (e,graph){
					console.log(e);
					console.log(graph.getChain('server.js'));
					var files = graph.getChain('server.js');
					for(var i = 0, n = files.length; i < n ; i++){
						scripts += '<script src="'+ files[i] + '"></script>\n';
					}
					res.end(data[0] + '<body>' + scripts + data[1]);
				})
			} else res.end(data);
		})
	}else if (req.url.split("/")[1] === "modules") {
		fs.readFile(req.url.split("/")[1] + "/" + req.url.split("/")[2], function (err, data) {
			if (err) throw err;
			res.end(data);
		})
	} else if (req.url.split(".")[1] === 'min' && req.url.split(".")[2] === 'js') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('libs' + req.url.split(".")[0] + "." + req.url.split(".")[1] +".js", function (err, data) {
			if (err) throw err;
			res.end(data);
		})
	}
	else if (req.url.split(".")[1] === 'js') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('libs' + req.url.split(".")[0]  +".js", function (err, data) {
			if (err) throw err;
			res.setHeader('Content-Type', 'application/javascript');
			res.end(data);
		})
	}
	else if (req.url.split(".")[1] === 'css') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('style' + req.url.split(".")[0]  +".css", function (err, data) {
			if (err) throw err;
			res.end(data);
		})
	}
	else if (req.url.split(".")[1] === 'woff') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('style' + req.url.split(".")[0]  +".woff", function (err, data) {
			if (err) throw err;
			res.end(data);
			console.log(req.url.split(".")[0]);
		})
	}
	else if (req.url.split(".")[1] === 'png') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('img' + req.url.split(".")[0]  +".png", function (err, data) {
			if (err) throw err;
			res.end(data);
			console.log(req.url.split(".")[0]);
		})
	}
	else if (req.url.split(".")[1] === 'jpg') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('img' + req.url.split(".")[0]  +".jpg", function (err, data) {
			if (err) throw err;
			res.end(data);
			console.log(req.url.split(".")[0]);
		})
	}
	else if (req.url.split(".")[1] === 'gif') {
		//console.log(req.url.split(".")[0]);
		fs.readFile('img' + req.url.split(".")[0]  +".gif", function (err, data) {
			if (err) throw err;
			res.end(data);
			console.log(req.url.split(".")[0]);
		})
	}
	else if (req.url.split(".")[1] === 'json') {
		res.writeHead(200,{"Content-Type": "text/json"})
		res.write(fs.readFileSync("." + req.url.split(".")[0]  +".json"))
		res.end();
	}	
	else {
		res.writeHead(404);
		res.end('Not found');
	}
});


serveur.listen(8000);