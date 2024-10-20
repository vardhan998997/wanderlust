const express = require("express");
const router = express.Router({mergeParams: true}); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);  // Throw an error with a message
    } else {
      next();
    }
  };

// Post route for reviews
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review({
      ...req.body.review,
      listing: req.params.id,
    });
  
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Created!");
    res.redirect(`/listings/${listing._id}`);
  }));
  
  // Delete Review Route
  router.delete("/:reviewId",
    wrapAsync(async (req, res) => {
      let { id, reviewId } = req.params;
  
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Corrected here
      await Review.findByIdAndDelete(reviewId);
      req.flash("success","Review Deleted!");
      res.redirect(`/listings/${id}`);
    })
  );


module.exports = router;