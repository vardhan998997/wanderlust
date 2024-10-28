const Review = require("../models/review.js");
const Listing = require("../models/listing.js");



module.exports.newReview=async (req, res) => {
    const { id } = req.params;  // Get listing ID

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;  // Set the author before saving the review
    await newReview.save();

    listing.reviews.push(newReview);  // Add review to listing
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};




module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params; // Get listing and review IDs
    console.log("Listing ID:", id, "Review ID:", reviewId); // Debug log

    // Remove the review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review from the database
    req.flash("success"," Review Deleted!");

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
};