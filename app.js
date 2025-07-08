if(process.env.NODE_ENV !="production"){
  require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose= require("mongoose"); 
const Listing= require("./models/listing.js");
const path =require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} =require("./schema.js");
const Review = require("./models/review.js");
const listings= require("./routes/listing.js")
const reviews= require("./routes/review.js")
const users= require("./routes/user.js")
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport= require("passport")
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLAS_URL;



main().then(()=>{
    console.log("connection successful");

})
.catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://localhost:27017/Shahiyatra');
// }

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// const store =MongoStore.create({
//   mongoUrl: 'mongodb://localhost:27017/Shahiyatra',
//   crypto: {
//     secret: process.env.SECRET,
    
// },
// touchAfter : 24 * 3600,
// })

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})

const sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7*24*60*60*1000),
    maxAge: 7*24*60*60*1000,
  },
}



// app.get("/", (req, res)=>{
//   res.send("working")
// } );

app.use(session (sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// app.post("/listings", (req, res, next) => {
//   console.log("Received data:", req.body);  // 🛠 Debugging
//   next();
// });
app.use((req, res, next)=>{
  res.locals.success =req.flash("success");
  res.locals.error =req.flash("error");
  res.locals.CurrUser = req.user;
  next();
})

    app.use("/listings", listings);
    app.use("/listings/:id/reviews", reviews);
    app.use("/", users);
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
//  });

app.all("*", (req, res, next)=>{
  next(new ExpressError(404, "page Not Found"))
})
app.use((err, req, res, next)=>{
  let {statusCode=500, message= "something went wrong"} =err;
  res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("server is listening to port 8080");
  });
  