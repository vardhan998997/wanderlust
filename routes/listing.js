const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // Async error handling
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");  // Assuming you have a cloud storage config in cloudConfig.js
const upload = multer({ storage }); // Multer setup for file uploads


// Route to handle both GET and POST for '/listings'
router.route("/")
  // GET: List all listings
  .get(wrapAsync(listingController.index)) // listingController.index fetches all listings
  // POST: Create a new listing (requires login, validation, and image upload)
  .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.newListing)); // Ensure 'listing[image]' is correct field in form


// Route to create a new listing (GET form)
router.get("/new", isLoggedIn, listingController.renderNewForm);


// Route to handle listing actions: Show, Update, and Delete
router.route("/:id")
  // GET: Show a specific listing
  .get(wrapAsync(listingController.showListing))

  // PUT: Update a specific listing (requires login, ownership, validation, and image upload)
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))

  // DELETE: Delete a specific listing (requires login and ownership)
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

  
// Route to edit a specific listing (GET form)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;

