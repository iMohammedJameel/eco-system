const mongoose = require("mongoose");

const MATERIAL_TYPES = ["plastic", "glass", "cardboard", "paper"];

const pricingSchema = new mongoose.Schema(
  {
    materialType: {
      type: String,
      enum: MATERIAL_TYPES,
      required: [true, "Material Type is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    pricePerKg: {
      type: Number,
      required: [true, "Price Per Kg is Required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "EGP",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

const Pricing = mongoose.model("Pricing", pricingSchema);

module.exports = Pricing;
module.exports.MATERIAL_TYPES = MATERIAL_TYPES;
