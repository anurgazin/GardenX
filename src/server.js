const express = require("express");
const app = express();
var path = require("path");
var upath = require("upath");
var bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const jwt = require("jsonwebtoken");
var userScheme = require("./schemes/userScheme");
var articleScheme = require("./schemes/articleScheme");
var threadScheme = require("./schemes/threadScheme");
var commentScheme = require("./schemes/commentsScheme");
var plantScheme = require("./schemes/plantsScheme");
var plantsListScheme = require("./schemes/plantsListScheme");
var marketplaceScheme = require("./schemes/marketplaceScheme");
const clientSessions = require("client-sessions");
var multer = require("multer");
const hbs = require("express-handlebars");
var mongoose = require("mongoose");
const TeachableMachine = require("@sashido/teachablemachine-node");

mongoose.Promise = require("bluebird");

const config = require("./config/config");
const { response } = require("express");
const commentsScheme = require("./schemes/commentsScheme");
const plantsScheme = require("./schemes/plantsScheme");
const connectionString = config.database_connection_string;

mongoose.connect(connectionString);

mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let today = new Date().toLocaleDateString("en-US");

// Load model
const URL = "./public/model/";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

// Load model
const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/fLhMEwnCB/",
});

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
function ensureAdmin(req, res, next) {
  if (!req.session.user.isAdmin) {
    res.redirect("/main");
  } else {
    next();
  }
}

var hbshelper = hbs.create({});

hbshelper.handlebars.registerHelper("trimString", function (passedString) {
  var theString = passedString.substring(0, 250);
  return new hbshelper.handlebars.SafeString(theString);
});
hbshelper.handlebars.registerHelper("isAuthor", function (options) {
  var hash = options.hash;
  var fnTrue = options.fn;
  var fnFalse = options.inverse;
  return hash.param1 == hash.param2 ? fnTrue(this) : fnFalse(this);
});
hbshelper.handlebars.registerHelper("select", function (selected, options) {
  return options
    .fn(this)
    .replace(
      new RegExp(' value="' + selected.toLowerCase() + '"'),
      '$& selected="selected"'
    );
});

const PLANTS_STORAGE = multer.diskStorage({
  destination: "./public/img/uploadedImg/plants",
  filename: function (req, file, cb) {
    console.log("Uploading Photo");
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const PLANTS_UPLOAD = multer({ storage: PLANTS_STORAGE });

const ARTICLE_STORAGE = multer.diskStorage({
  destination: "./public/img/uploadedImg/article",
  filename: function (req, file, cb) {
    console.log("Uploading Photo");
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const ARTICLE_UPLOAD = multer({ storage: ARTICLE_STORAGE });

const MARKETPLACE_STORAGE = multer.diskStorage({
  destination: "./public/img/uploadedImg/marketplace",
  filename: function (req, file, cb) {
    console.log("Uploading Photo");
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const MARKETPLACE_UPLOAD = multer({ storage: MARKETPLACE_STORAGE });

const CV_STORAGE = multer.diskStorage({
  destination: "./public/img/uploadedImg/computer_vision",
  filename: function (req, file, cb) {
    console.log("Uploading Photo");
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const CV_UPLOAD = multer({ storage: CV_STORAGE });

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    auth: {
      user: "vacationroyal4@gmail.com", //your email account
      pass: "vacROYAL@1984", // your password
    },
  })
);

app.use(
  clientSessions({
    cookieName: "session",
    secret: "super_secret_for_gardenX",
    duration: 10 * 60 * 10000, // 100 min
    activeDuration: 10000 * 60, //10 min
  })
);
// Routes
app.get("/", function (req, res) {
  res.redirect("/main");
});
// GET Routes for Add Pages
app.get("/addArticle", ensureLogin, (req, res) => {
  res.render("addArticle", {
    style: "/css/forgot_pass.css",
    layout: false,
  });
});
app.get("/createPlant", ensureAdmin, ensureLogin, (req, res) => {
  res.render("createPlant", {
    style: "/css/forgot_pass.css",
    layout: false,
  });
});
app.get("/addThread", ensureLogin, (req, res) => {
  res.render("addThread", {
    style: "/css/forgot_pass.css",
    layout: false,
  });
});
app.get("/addPlant", ensureLogin, (req, res) => {
  res.render("addPlant", {
    style: "/css/forgot_pass.css",
    layout: false,
  });
});
app.get("/addPlant/:plantType", ensureLogin, (req, res) => {
  var plantType = req.params.plantType;
  res.render("addPlant", {
    passed: true,
    type: plantType,
    style: "/css/forgot_pass.css",
    layout: false,
  });
});
app.get("/addLot", ensureLogin, (req, res) => {
  res.render("addLot", {
    style: "/css/forgot_pass.css",
    user: req.session.user,
    layout: false,
  });
});
// GET Routes for Regular Pages
app.get("/myplants", ensureLogin, (req, res) => {
  plantsListScheme
    .find({ user: req.session.user._id })
    .lean()
    .exec()
    .then((plantList) => {
      res.render("myplants", {
        user: req.session.user,
        plants: plantList[0].plants,
        layout: false,
      });
    })
    .catch(()=>{
      res.render("myplants", {
        user: req.session.user,
        layout: false,
      });
    })
});
app.get("/knowledgeBase", (req, res) => {
  plantsScheme
    .find({})
    .lean()
    .exec()
    .then((plants) => {
      //console.log(plants);
      res.render("knowledgeBase", {
        user: req.session.user,
        plants: plants,
        layout: false,
        style: "/css/kbase.css",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/login", (req, res) => {
  res.render("login", {
    layout: false,
  });
});
app.get("/registration", (req, res) => {
  res.render("register", {
    layout: false,
  });
});
app.get("/photoRecognition", (req, res) => {
  res.render("photoRecognition", {
    layout: false,
    style: "/css/plant_recognition.css",
  });
});
app.get("/signout", (req, res) => {
  req.session.user = undefined;
  res.redirect("/login");
});
app.get("/forgot", (req, res) => {
  res.render("forgot", {
    layout: false,
  });
});
app.get("/main", (req, res) => {
  articleScheme
    .find({})
    .lean()
    .exec()
    .then((articles) => {
      res.render("main", {
        article: articles,
        user: req.session.user,
        layout: false,
      });
    });
});
app.get("/thread", (req, res) => {
  threadScheme
    .find({})
    .lean()
    .exec()
    .then((threads) => {
      res.render("thread", {
        thread: threads,
        user: req.session.user,
        layout: false,
      });
    });
});
app.get("/marketplace", (req, res) => {
  marketplaceScheme
    .find({})
    .lean()
    .exec()
    .then((items) => {
      res.render("marketplace", {
        lots: items,
        user: req.session.user,
        layout: false,
        style: "/css/marketplace.css",
      });
    });
});
// GET Routes for Details Page
app.get("/plantDetails/:plantType", function (req, res) {
  const type = req.params.plantType;
  plantScheme
    .find({ name: type })
    .lean()
    .exec()
    .then((plant) => {
      //console.log(plant[0].tips.split("\n"))
      res.render("plantDetails", {
        user: req.session.user,
        details: plant[0],
        tips: plant[0].tips.split("\n"),
        layout: false,
        style: "/css/plantDetails.css",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/threadDetails/:threadId", function (req, res) {
  const threadId = req.params.threadId;
  threadScheme
    .findById(threadId)
    .lean()
    .exec()
    .then((thread) => {
      commentScheme
        .find({ thread: threadId })
        .lean()
        .exec()
        .then((comments) => {
          res.render("threadDetails", {
            user: req.session.user,
            details: thread,
            comment: comments,
            style: "/css/thread_details.css",
            layout: false,
          });
        });
    });
});

app.get("/articleDetails/:articleId", function (req, res) {
  const articleId = req.params.articleId;
  articleScheme
    .findById(articleId)
    .lean()
    .exec()
    .then((article) => {
      res.render("articleDetails", {
        user: req.session.user,
        details: article,
        layout: false,
        style: "/css/main.css",
      });
    });
});

app.get("/marketplaceLot/:lotId", async function (req, res) {
  const lotId = req.params.lotId;
  marketplaceScheme
    .findById(lotId)
    .lean()
    .exec()
    .then((details) => {
      res.render("marketplaceLot", {
        user: req.session.user,
        details: details,
        layout: false,
        style: "/css/marketplace.css",
      });
    });
});

// GET and POST Routes for Edit Pages
app.get("/editArticle/:articleId", ensureLogin, (req, res) => {
  const articleId = req.params.articleId;
  articleScheme
    .findById(articleId)
    .lean()
    .exec()
    .then((article) => {
      res.render("editArticle", {
        user: req.session.user,
        details: article,
        editMode: true,
        style: "/css/forgot_pass.css",
        layout: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post(
  "/editArticle/:articleId",
  ensureLogin,
  ARTICLE_UPLOAD.single("photo"),
  async (req, res) => {
    const FORM_DATA = req.body;
    const FORM_FILE = req.file;
    const articleId = req.params.articleId;
    if (FORM_FILE) {
      FORM_FILE.path = FORM_FILE.path.replace("public", "");
      var article = await articleScheme.findByIdAndUpdate(articleId, {
        title: FORM_DATA.title,
        text: FORM_DATA.desc,
        fileName: FORM_FILE.path,
      });
    } else {
      var article = await articleScheme.findByIdAndUpdate(articleId, {
        title: FORM_DATA.title,
        text: FORM_DATA.desc,
      });
    }
    article
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// Edit Lot(GET and POST requests)
app.get("/editLot/:lotId", ensureLogin, (req, res) => {
  const lotId = req.params.lotId;
  marketplaceScheme
    .findById(lotId)
    .lean()
    .exec()
    .then((lot) => {
      res.render("editLot", {
        user: req.session.user,
        details: lot,
        editMode: true,
        style: "/css/forgot_pass.css",
        layout: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post(
  "/editLot/:lotId",
  ensureLogin,
  MARKETPLACE_UPLOAD.single("photo"),
  async (req, res) => {
    const FORM_DATA = req.body;
    const FORM_FILE = req.file;
    const lotId = req.params.lotId;
    if (FORM_FILE) {
      FORM_FILE.path = FORM_FILE.path.replace("public", "");
      var lot = await marketplaceScheme.findByIdAndUpdate(lotId, {
        title: FORM_DATA.title,
        description: FORM_DATA.desc,
        contact: FORM_DATA.email,
        price: FORM_DATA.price,
        photo: FORM_FILE.path,
      });
    } else {
      var lot = await marketplaceScheme.findByIdAndUpdate(lotId, {
        title: FORM_DATA.title,
        description: FORM_DATA.desc,
        contact: FORM_DATA.email,
        price: FORM_DATA.price,
      });
    }
    lot
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/marketplace");
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// Edit Thread (GET and POST requests)
app.get("/editThread/:threadId", ensureLogin, (req, res) => {
  const threadId = req.params.threadId;
  threadScheme
    .findById(threadId)
    .lean()
    .exec()
    .then((thread) => {
      res.render("editThread", {
        user: req.session.user,
        details: thread,
        editMode: true,
        style: "/css/forgot_pass.css",
        layout: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/editThread/:threadId", ensureLogin, async (req, res) => {
  const FORM_DATA = req.body;
  const threadId = req.params.threadId;
  var thread = await threadScheme.findByIdAndUpdate(threadId, {
    title: FORM_DATA.title,
    text: FORM_DATA.desc,
  });
  thread
    .save()
    .then((response) => {
      console.log(response);
      res.redirect("/thread");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Comment
app.get("/editComment/:commentId", ensureLogin, (req, res) => {
  const commentId = req.params.commentId;
  commentsScheme
    .findById(commentId)
    .lean()
    .exec()
    .then((comment) => {
      res.render("editComment", {
        user: req.session.user,
        details: comment,
        editMode: true,
        style: "/css/forgot_pass.css",
        layout: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/editComment/:commentId", ensureLogin, async (req, res) => {
  const FORM_DATA = req.body;
  const commentId = req.params.commentId;
  var comment = await commentsScheme.findByIdAndUpdate(commentId, {
    text: FORM_DATA.desc,
  });
  comment
    .save()
    .then((response) => {
      console.log(response);
      res.redirect(`/threadDetails/${comment.thread}`);
    })
    .catch((err) => {
      console.log(err);
    });
});
// User
app.get("/editUser", ensureLogin, (req, res) => {
  res.render("editUser", {
    details: req.session.user,
    style: "/css/forgot_pass.css",
    layout: false,
  });
});

app.post("/editUser", ensureLogin, async (req, res) => {
  const FORM_DATA = req.body;
  const userId = req.session.user._id;
  var user = await userScheme.findByIdAndUpdate(userId, {
    firstName: FORM_DATA.firstName,
    lastName: FORM_DATA.lastName,
    email: FORM_DATA.email,
  });
  user
    .save()
    .then((response) => {
      //console.log(user.email);
      req.session.user = undefined;
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
});

// GET Requests for Delete pages

// Test for Remove Plant from Plant List

app.get("/removePlant/:plantId", ensureLogin, (req, res) => {
  const plantId = req.params.plantId;
  plantsListScheme
    .updateOne(
      { user: req.session.user._id },
      {
        $pull: {
          plants: { _id: plantId },
        },
      }
    )
    .then((response) => {
      console.log(response);
      res.redirect("/myplants");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/deleteArticle/:articleId", ensureLogin, (req, res) => {
  const articleId = req.params.articleId;
  articleScheme
    .findByIdAndDelete(articleId)
    .then((response) => {
      console.log(response);
      res.redirect("/main");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/deleteLot/:lotId", ensureLogin, (req, res) => {
  const lotId = req.params.lotId;
  marketplaceScheme
    .findByIdAndDelete(lotId)
    .then((response) => {
      console.log(response);
      res.redirect("/marketplace");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/deleteThread/:threadId", ensureLogin, (req, res) => {
  const threadId = req.params.threadId;
  threadScheme
    .findByIdAndDelete(threadId)
    .then((response) => {
      console.log(response);
      res.redirect("/thread");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/deleteComment/:commentId", ensureLogin, (req, res) => {
  const commentId = req.params.commentId;
  commentScheme
    .findByIdAndDelete(commentId)
    .then((response) => {
      console.log(response);
      res.redirect("/thread");
    })
    .catch((err) => {
      console.log(err);
    });
});

// POST Request for LOGIN
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
      _id: found._id,
      firstName: found.firstName,
      lastName: found.lastName,
      isAdmin: found.isAdmin,
      email: found.email,
    };
    res.redirect("/myplants");
  } catch (e) {
    res.render("login", {
      errorMsg: "Login or Password is not correct!",
      layout: false,
    });
  }
});

// RESET-PWD
app.post("/forgot", async (req, res) => {
  const email = req.body.email;
  try {
    const found = await userScheme.findByEmail(email);
    const secret = process.env.JWT_SECRET + found.password;
    const payload = {
      email: found.email,
      id: found._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:${HTTP_PORT}/reset-pwd/${found._id}/${token}`;

    var mailOptions = {
      from: "vacationroyal4@gmail.com",
      to: found.email,
      subject: "Password Change",
      html: `Hello,<br> Please Click on the link to change your password.<br><a href="${link}">Click here</a>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        console.log("SUCCESS: " + info.response);
      }
    });
    console.log(link);
    res.render("forgot", {
      conMsg: `Link has been sent to ${found.email}`,
      layout: false,
    });
  } catch (e) {
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
});
app.get("/reset-pwd/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  try {
    const found = await userScheme.findById(id);
    req.session.user = {
      _id: found._id,
      firstName: found.firstName,
      lastName: found.lastName,
      isAdmin: found.isAdmin,
      email: found.email,
    };
    const secret = process.env.JWT_SECRET + found.password;
    const payload = jwt.verify(token, secret);
    res.render("resetpwd", {
      user: req.session.user,
      token: token,
      style: "/css/forgot_pass.css",
      layout: false,
    });
  } catch (e) {
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
});
app.post("/reset-pwd/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  let password = req.body.password;
  try {
    const found = await userScheme.findById(id);
    const secret = process.env.JWT_SECRET + found.password;
    const payload = jwt.verify(token, secret);
    password = await bcrypt.hash(password, 10);
    console.log(password);
    await userScheme.findByIdAndUpdate(found._id, {
      password: password,
    });
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.render("forgot", {
      errorMsg: "User is not exist",
      layout: false,
    });
  }
});
// POST request for create
app.post(
  "/createArticle",
  ensureLogin,
  ARTICLE_UPLOAD.single("photo"),
  (req, res) => {
    const FORM_DATA = req.body;
    var FORM_FILE = req.file;
    console.log(FORM_FILE.filename);
    FORM_FILE.path = FORM_FILE.path.replace("public", "");
    var article = new articleScheme({
      title: FORM_DATA.title,
      text: FORM_DATA.desc,
      date: today,
      fileName: FORM_FILE.path,
      author: req.session.user.email,
    });
    article
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

app.post("/classifyImage", CV_UPLOAD.single("photo"), (req, res) => {
  const image = req.file;
  //var path2 = image.path.replace("public/", "http://localhost:8080/");
  //console.log(upath.normalizeSafe(path2));
  return model
    .classify({
      imageUrl: upath
        .normalize(image.path)
        .replace("public/", "https://garden-x.herokuapp.com/"),
    })
    .then((predictions) => {
      console.log(predictions[0]);
      plantsScheme
      .find({"name": predictions[0].class.toLowerCase()})
      .lean()
      .exec()
      .then((recognized)=>{
        console.log(recognized);
        res.render("photoRecognition",{
          user: req.session.user,
          passed: true,
          plant: predictions[0],
          recognized: recognized[0],
          tips: recognized[0].tips.split("\n"),
          photo: upath.normalizeSafe(recognized[0].photo),
          layout: false,
          style: "/css/plant_recognition.css",
          js: "/js/utils/animation.js"
        })
      })

      //return res.json(predictions);
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send("Something went wrong!");
    });
});

app.post(
  "/createLot",
  ensureLogin,
  MARKETPLACE_UPLOAD.single("photo"),
  (req, res) => {
    const FORM_DATA = req.body;
    var FORM_FILE = req.file;
    //console.log(upath.normalizeSafe(FORM_FILE.path));
    FORM_FILE.path = FORM_FILE.path.replace("public", "");
    var lot = new marketplaceScheme({
      title: FORM_DATA.title,
      description: FORM_DATA.desc,
      contact: FORM_DATA.email,
      date: today,
      price: FORM_DATA.price,
      photo: upath.normalizeSafe(FORM_FILE.path),
      owner: req.session.user._id,
    });
    lot
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/marketplace");
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

app.post(
  "/createPlantType",
  ensureLogin,
  ensureAdmin,
  PLANTS_UPLOAD.single("photo"),
  (req, res) => {
    const FORM_DATA = req.body;
    var FORM_FILE = req.file;
    console.log(FORM_FILE.filename);
    FORM_FILE.path = FORM_FILE.path.replace("public", "");
    var plant = new plantScheme({
      name: FORM_DATA.title,
      tips: FORM_DATA.tips,
      schedule: FORM_DATA.schedule,
      photo: FORM_FILE.path,
    });
    plant
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

app.post("/createPlant", ensureLogin, (req, res) => {
  const FORM_DATA = req.body;
  plantsListScheme.exists({ user: req.session.user._id }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      if (doc) {
        plantsListScheme
          .updateOne(
            { user: req.session.user._id },
            {
              $push: {
                plants: {
                  title: FORM_DATA.title,
                  type: FORM_DATA.type,
                },
              },
            }
          )
          .then((response) => {
            res.redirect("/myplants");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        var plant = new plantsListScheme({
          user: req.session.user._id,
          plants: [
            {
              title: FORM_DATA.title,
              type: FORM_DATA.type,
            },
          ],
        });
        plant
          .save()
          .then((response) => {
            res.redirect("/myplants");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });
});

app.post("/createThread", ensureLogin, (req, res) => {
  const FORM_DATA = req.body;
  console.log(FORM_DATA.title);
  var thread = new threadScheme({
    title: FORM_DATA.title,
    text: FORM_DATA.desc,
    date: today,
    author: req.session.user.email,
  });
  thread
    .save()
    .then((response) => {
      console.log(response);
      res.redirect("/thread");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/createComment/:threadId", ensureLogin, (req, res) => {
  const threadId = req.params.threadId;
  const FORM_DATA = req.body;
  var comment = new commentScheme({
    text: FORM_DATA.comment,
    date: today,
    thread: threadId,
    author: req.session.user.email,
  });
  comment
    .save()
    .then((response) => {
      console.log(response);
      res.redirect(`/threadDetails/${threadId}`);
    })
    .catch((err) => {
      console.log(err);
    });
});
// Registration POST
app.post("/createAccount", (req, res) => {
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
      res.redirect("/myplants");
    })
    .catch((err) => {
      res.render("register", {
        err: true,
        layout: false,
      });
      console.log(err);
    });
});

// Callback Function
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.listen(HTTP_PORT, onHttpStart);
