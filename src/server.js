const express = require("express");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var userScheme = require("./schemes/userScheme");
const clientSessions = require("client-sessions");
const hbs = require("express-handlebars");
var mongoose = require("mongoose");

mongoose.Promise = require("bluebird");

const config = require("./config/config");
const { findById } = require("./schemes/userScheme");
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

var transporter = nodemailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  auth: {
    user: "vacationroyal4", //your email account
    pass: "vacROYAL@1984", // your password
  },
});


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
  res.render("login", {
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
app.get("/registration",(req,res)=>{
  res.render("register",{
    layout: false
  })
})

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
    res.render("myplants", { user: req.session.user, layout: false });
  } catch (e) {
    res.render("login", {
      errorMsg: "Login or Password is not correct!",
      layout: false,
    });
  }
});

app.get("/forgot",(req,res)=>{
  res.render("forgot",{
    layout: false
  })
})
app.post("/forgot", async (req,res)=>{
  const email = req.body.email;
  try{
    const found = await userScheme.findByEmail(email);
    const secret = process.env.JWT_SECRET + found.password;
    const payload = {
      email: found.email,
      id: found._id
    }
    const token = jwt.sign(payload, secret, {expiresIn: '15m'})
    const link = `localhost:${HTTP_PORT}/reset-pwd/${found._id}/${token}`

    var mailOptions = {
      from: "vacationroyal4@gmail.com",
      to: found.email,
      subject: "Password Change",
      html: "Hello,<br> Please Click on the link to change your password.<br><a href="+link+">Click here</a>"
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        console.log("SUCCESS: " + info.response);
      }
    });



    console.log(link)
    res.render("forgot",{
      conMsg: "Link has been sent",
      layout: false,      
    })
  }
  catch(e){
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
})
app.get("/reset-pwd/:id/:token", async (req,res)=>{
  const {id, token} = req.params;
  try {
    const found = await userScheme.findById(id);
    req.session.user = {
      _id: found._id,
      firstName: found.firstName,
      lastName: found.lastName,
      isAdmin: found.isAdmin,
      email: found.email,
    }
    const secret = process.env.JWT_SECRET + found.password;
    const payload = jwt.verify(token, secret);
    res.render('resetpwd',{
      user: req.session.user,
      token: token,
      layout: false
    });
  } catch (e) {
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
})

app.post("/reset-pwd/:id/:token", async (req,res)=>{
  const {id, token} = req.params;
  let password = req.body.password;
  try {
    const found = await userScheme.findById(id);
    const secret = process.env.JWT_SECRET + found.password;
    const payload = jwt.verify(token, secret);
    password = await bcrypt.hash(password, 10);
    console.log(password);
    await userScheme.findByIdAndUpdate(found._id,{
      password: password
    })
    res.redirect("/login")
  } catch (e) {
    console.log(e)
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
})

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
