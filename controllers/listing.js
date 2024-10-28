const { request } = require("http");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



// Get all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");  // Render form for creating new listing
};

// Show individual listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews", populate: { path: "author" }
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};




// Create a new listing
module.exports.newListing = async (req, res) => {
    try {
        // Geocoding request
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (!response.body.features.length) {
            req.flash("error", "Invalid location provided.");
            return res.redirect("/listings/new");
        }

        // Handle file upload and create new listing
        if (!req.file) {
            req.flash("error", "Image upload failed.");
            return res.redirect("/listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing); // Create a new listing
        newListing.owner = req.user._id;
        newListing.image = { url, filename }; // Assign the image URL and filename
        newListing.geometry = response.body.features[0].geometry;

        // Save new listing to the database
        let savedListing = await newListing.save();
        console.log(savedListing);

        // Send success flash message and redirect
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (error) {
        console.error("Error creating new listing:", error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings/new");
    }
};




// Render edit form for a listing
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
//     let originalImageUrl = listing.image.url;
// originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit", { listing });
};

// Update a listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // Find and update the listing with new form data
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Check if there's a new image upload
    if (typeof req.file!="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };  // Update image field with new data
    // Save updated listing
    await listing.save();
    }


    // Flash success message and redirect to the updated listing page
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete a listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

