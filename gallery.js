var express = require("express");
var app = express();
var request = require("request");
app.use(express.static("public"));

var fs = require("fs");
var sharp = require("sharp");

app.get("/", function(req, res) {
	fs.readdir("public/photos/", function(err, items) {
		res.render("index.ejs", { pictures: items });	
	});
});

app.get("/get/image/:what", function(req, res) {
	if(req.params.what == "all") {

		fs.readdir("public/photos/", function(err, items) {
			let pictures = { items };
			res.end(JSON.stringify(pictures));
		});
	} else {
		sharp("public/photos/" + req.params.what)
		.resize(200, 200, {
			fit: sharp.fit.inside,
			withoutEnlargement: true
		})
		.toFormat("jpeg")
		.toBuffer()
		.then(function(outputBuffer) {
			let encoded = Buffer.from(outputBuffer).toString("base64");
			res.end(encoded);
		});
	}
});

app.listen(3003, "0.0.0.0", function() {
	console.log("Gallery has started!");
});


