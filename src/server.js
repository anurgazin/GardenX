const express = require("express");
const app = express();
var path = require("path");
const hbs = require("express-handlebars");

// Configurations
const HTTP_PORT = process.env.PORT || 8080;

// Setting up paths
var publicDirPath = path.join(__dirname, '../public');
var viewsPath = path.join(__dirname, '../views');

// Setup views folder
app.set('views', viewsPath);
// Setup static directory to serve
app.use(express.static(publicDirPath));

app.engine(".hbs", hbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Routes
app.get("/", function (req, res) {
  var someData = {
    name: "John",
    age: 23,
    occupation: "developer",
    company: "Scotiabank",
    visible: "true",
  };
  res.render("index", {
    data: someData,
    layout: false,
  });
});

// Callback Function
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.listen(HTTP_PORT, onHttpStart);
