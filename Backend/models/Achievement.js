const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Achievement Name is Required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "🏅",
    },
    // The metric being measured
    metric: {
      type: String,
      enum: ["totalDeposits", "depositsCount", "balance", "co2Saved"],
      required: [true, "Metric is Required"],
    },
    // The threshold value to unlock this achievement
    threshold: {
      type: Number,
      required: [true, "Threshold is Required"],
      min: 0,
    },
    // Reward in EGP added to user balance when unlocked
    xpReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    badgeColor: {
      type: String,
      default: "#1a5c3a",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = Achievement;
