const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username Must Be Required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email Must Be Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number Must Be Required"],
    },
    password: {
      type: String,
      required: [true, "Password Must Be Required"],
      minlength: 6,
      select: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalDeposits: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "active", "good", "excellent"],
      default: "beginner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Create Pre Hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Create Method Compare Password
userSchema.methods.comparePassword = async function (matchedPassword) {
  return await bcrypt.compare(matchedPassword, this.password);
};

// Create Model
const User = mongoose.model("User", userSchema);

// Export Module
module.exports = User;
