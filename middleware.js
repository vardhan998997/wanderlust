const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

// Middleware to save the redirect URL for post-login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (!req.session.redirectUrl && req.originalUrl !== '/login' && req.originalUrl !== '/signup') {
        req.session.redirectUrl = req.originalUrl;
    }
    res.locals.redirectUrl = req.session.redirectUrl || '/listings'; // Default to '/listings' if no redirect URL
    next();
};

// Middleware to check if the user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};

// Middleware to validate listings using Joi schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);  // Fixed from ExceptionError to ExpressError
    }
    next();
};




// Middleware to validate review using Joi schema
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};






// Middleware to check if the user is the author of a review
module.exports.isreviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;  // Get listing and review IDs from params

    // Find the review by its ID
    let review = await Review.findById(reviewId);

    // Check if the current user is the author of the review
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    // If the user is the author, proceed
    next();
};