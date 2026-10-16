const mongoose = require("mongoose");

const discountOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0, min: 0 },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Partner Name is Required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["supermarket", "electronics", "pharmacy", "fashion", "food", "services", "other"],
      default: "supermarket",
    },
    logo: { type: String, default: null },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
    governorate: { type: String, trim: true },
    discountOffers: [discountOfferSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
