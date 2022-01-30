const express = require("express");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
var userScheme = require("./schemes/userScheme");
const hbs = require("express-handlebars");
var mongoose = require("mongoose");

mongoose.Promise = require("bluebird");

const config = require("./config/config");
const connectionString = config.database_connection_string;

mongoose.connect(connectionString);

mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurations
const HTTP_PORT = process.env.PORT || 8080;

// Setting up paths
var publicDirPath = path.join(__dirname, "../public");
var viewsPath = path.join(__dirname, "../views");

// Setup views folder
app.set("views", viewsPath);
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
app.get("/myplants", (req, res) => {
  res.render("myplants", {
    layout: false,
  });
});
app.get("/login", (req, res) => {
  res.render("login", {
    layout: false,
  });
});
app.post("/myplants", (req, res) => {
  const FORM_DATA = req.body;
  var user = new userScheme({
    firstName: FORM_DATA.firstName,
    lastName: FORM_DATA.lastName,
    password: FORM_DATA.password,
    email: FORM_DATA.email,
  });
  user
    .save()
    .then((response) => {
      console.log(response);
      console.log("I am here");
      res.render("myplants", {
        data: FORM_DATA,
        layout: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Callback Function
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.listen(HTTP_PORT, onHttpStart);
