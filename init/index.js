const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlus");
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit the process with an error code
  }
}

const initDB = async () => {
  try {
    // Ensure the database connection is established
    await main();

    // Delete existing entries in the Listing collection
    await Listing.deleteMany({});

    // Update the data with the owner field and insert it into the collection
    initData.data = initData.data.map((obj) => ({ ...obj, owner: '6714e8d677836a21efeacc99' }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");

  } catch (err) {
    console.error("Error initializing data:", err);
  } finally {
    // Close the connection after initialization is complete
    mongoose.connection.close();
  }
};

initDB();
