const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Machine Name is Required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is Required"],
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    governorate: {
      type: String,
      required: [true, "Governorate is Required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "nearlyFull", "offline"],
      default: "active",
    },
    fillPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalCollected: {
      type: Number,
      default: 0,
    },
    lastPingAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Machine = mongoose.model("Machine", machineSchema);

module.exports = Machine;
