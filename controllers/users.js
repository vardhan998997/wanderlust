const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const User=require("../models/user.js");


module.exports.renderSingupForm=(req,res)=>{
    res.render("users/signup.ejs");
};



module.exports.signup=async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        console.log(registeredUser);

        // Log in the user immediately after signing up
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};




module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};


module.exports.login= async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");

    // Redirect to the saved URL or a default page
    let redirectUrl = res.locals.redirectUrl || '/listings';
    
    // Clear the session after using the redirect URL
    delete req.session.redirectUrl;
    
    res.redirect(redirectUrl);
};



module.exports.logout=(req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
};