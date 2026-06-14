const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is Required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["superAdmin", "operationsManager"],
      default: "operationsManager",
    },
  },
  { timestamps: true },
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = async function (matchedPassword) {
  return await bcrypt.compare(matchedPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
