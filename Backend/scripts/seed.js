// Require Dotenv
require("dotenv").config();
// Require Mongoose
const mongoose = require("mongoose");
// Admin Model
const Admin = require("../models/Admin");

const seedSuperAdmin = async () => {
  try {
    // DB Connected
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Is Connected");

    // Check Admin Already Exist
    const existAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existAdmin) return console.log("Admin Already Found");

    // Create New Super Admin
    const newAdmin = {
      username: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "superAdmin",
    };

    const admin = await Admin.create(newAdmin);
    console.log("Super Admin Created:", admin);
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.connection.close();
    console.log("DB Is Closed");
    process.exit(0);
  }
};

// Run Function
seedSuperAdmin();
