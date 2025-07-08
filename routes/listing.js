const express= require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} =require("../schema.js");
const Listing= require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");
const multer  = require('multer')
const {storage}= require("../cloudConfig.js")
const upload = multer({ storage })




const validateListing=(req, res, next)=>{
  let{error}= listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
  };

router.get("/", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
     res.render("listings/index.ejs", {allListings});
 
 })
 );
 //new route
 router.get("/new",isLoggedIn, (req, res) => {
 
   res.render("listings/new.ejs");
 });
 
 //show Route
router.get("/:id", 
    wrapAsync(async (req, res)=>{
   let {id} = req.params;
   const listing = await Listing.findById(id).populate("reviews").populate("ownerId");

   console.log(listing);
   if(!listing){
    req.flash("error", "Listing you requested does not exist");
    res.redirect("/listings");
   }
   
    res.render("listings/show.ejs", {listing, currUser: req.user});
 })
 );
 //Create Route
router.post("/", isLoggedIn, upload.single("listing[image][url]"),
   wrapAsync(async (req, res, next) => {
    let filename =req.file.filename;
    let url = req.file.path;
    
   const newListing = new Listing(req.body.listing);

   newListing.ownerId = req.user._id;
   newListing.image={filename, url};
   await newListing.save();
   req.flash("success", "New Listing Created!")
   res.redirect("/listings");
 })
 );
 //Edit Route
 router.get("/:id/edit", isLoggedIn, 
   wrapAsync(async (req, res) => {
   let { id } = req.params;
   const listing = await Listing.findById(id);
   if(!listing){
    req.flash("error", "Listing you requested does not exist");
    res.redirect("/listings");
   }
   res.render("listings/edit.ejs", { listing });
 })
 );
 
 //Update Route
 router.put("/:id", isLoggedIn, upload.single("listing[image][url]"), wrapAsync(async (req, res) => {
   let { id } = req.params;
  
   let delisting = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   if(typeof req.file !== "undefined"){
    let filename =req.file.filename;
    let url = req.file.path;
    delisting.image = {filename, url};
    await delisting.save();
   }
   res.redirect(`/listings/${id}`);
 })
 );
 //Delete Route
 router.delete("/:id",isLoggedIn, wrapAsync(async (req, res) => {
   let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
 })
 );
 
 module.exports=router;