
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var methodOverride = require("method-override");


var app = express();

// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8082;

// BodyParser makes it possible for our server to interpret data sent to it.
// The code below is pretty standard.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


// --------------------------
app.use(express.static(__dirname + '/assets'));

// app.get('/images/bridge.JPG', function(req, res){
//   res.sendFile(__dirname + 'assets/images/bridge.JPG');
// });


  app.get("/index", function(req, res) {
    res.sendFile(path.join(__dirname, "./index.html"));
  });

    app.get("/signup", function(req, res) {
    res.sendFile(path.join(__dirname, "./signup.html"));
  });

  app.use(function(req, res) {
    res.sendFile(path.join(__dirname, "./index.html"));
  });

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
