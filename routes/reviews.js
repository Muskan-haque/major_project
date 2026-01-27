const express=require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/reviews.js");
const{validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../Controllers/reviews.js");
//Reviews
//Post Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;