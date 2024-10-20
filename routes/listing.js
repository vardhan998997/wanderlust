const express = require("express"); 
const route = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

// Middleware to validate listings using Joi schema
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);  // Throw an error with a message
    } else {
        next();
    }
};

// Index Routes
route.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

// New listing route
route.get("/new", (req, res) => {
    res.render("listings/new");  // Render new listing form
});

// Show specific listing route
route.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing your requested for does not exist!");
        res.redirect("/listings");
    }
    // Fixed the render path here
    res.render("listings/show", { listing });  // Render listing details
}));

// Create a new listing
route.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

// Edit listing route
route.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing your requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit", { listing });  // Render edit form
}));

// Update listing route
route.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Successfully Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete listing route
route.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = route;      

