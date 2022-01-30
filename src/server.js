const express = require("express");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
var userScheme = require("./schemes/userScheme");
const clientSessions = require("client-sessions");
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


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(
  clientSessions({
    cookieName: "session",
    secret: "super_secret_for_gardenX",
    duration: 5 * 60 * 1000, //5 min
    activeDuration: 1000 * 60, //1min
  })
);

// Routes
app.get("/", function (req, res) {
  res.render("index", {
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

app.post("/login", async (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  if (username === "" || password === "") {
    return res.render("login", {
      errorMsg: "Missing Credentials.",
      layout: false,
    });
  }
  try {
    const found = await userScheme.findByCredentials(username, password);
    req.session.user = {
      firstName: found.firstName,
      lastName: found.lastName,
      isAdmin: found.isAdmin,
      email: found.email,
    };
    console.log(req.session.user)
    res.render("myplants", { user: req.session.user, layout: false });
  } catch (e) {
    res.render("login", {
      errorMsg: "login does not exist!",
      layout: false,
    });
  }
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
        user: FORM_DATA,
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
