const express = require("express");
const app = express();
var path = require("path");
const hbs = require("express-handlebars");
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + "/"));

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.engine(".hbs", hbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

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

app.listen(HTTP_PORT, onHttpStart);
