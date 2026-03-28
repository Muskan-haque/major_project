require("dotenv").config();

// basic setup
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;  //  correct
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

// DB URL
const dburl = process.env.ATLASDB_URL;


async function main() {
  // 1️Connect DB
  await mongoose.connect(dburl);
  console.log("MongoDB connection successful");

  // 2️ Create Mongo Session Store AFTER DB connect
console.log("DB connected");

console.log("Creating session store...");
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

console.log("Store created");

  // 3️ Session Options
  const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  };

  // 4️Session & Flash
  app.use(session(sessionOptions));
  app.use(flash());

  // 5️Passport (AFTER session)
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(user.authenticate()));
  passport.serializeUser(user.serializeUser());
  passport.deserializeUser(user.deserializeUser());

  // 6️Flash + current user middleware
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
  });

  // 7️Routes
  app.use("/listings", listingRouter);
  app.use("/listings/:id/reviews", reviewRouter);
  app.use("/", userRouter);

  // 8️404 Handler
  app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
  });

  // 9️Error Handler
  app.use((err, req, res, next) => {
    let { statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { err });
  });

  // Start Server (LAST)
  app.listen(8080, () => {
    console.log("app is listening on port 8080");
  });
}

// Run main
main().catch((err) => {
  console.log("Server start error:", err);
});
