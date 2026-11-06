console.log("Starting app...");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");

const path = require("path");
const routes = require("./routes/routes");
const cors = require("cors");
const User = require("./models/user");

app.set("trust proxy", 1);

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.use(express.json());

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "views");

// serving FontAwesome via Express Staitc
app.use(
  "/fontawesome",
  express.static(
    path.join(__dirname, "node_modules/@fortawesome/fontawesome-free"),
  ),
);
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist")),
);
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(
  cors({
    origin: "https://to-do-list-frontend-nu-two.vercel.app",
    credentials: true,
  }),
);

app.use(csrfProtection);

app.get("/csrf", (req, res, next) => {
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    return res.json({ csrfToken: req.csrfToken() });
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;

  return res.status(699).json({ message: message });
});

app.use(routes);

console.log("Comment before MONGODB_URI...");

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 8000);

    // const io = require("./socket").init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client connected!");
    // });
  })
  .catch((err) => {
    console.log(err);
  });
