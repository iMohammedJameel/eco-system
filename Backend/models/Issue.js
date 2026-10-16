const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    type: {
      type: String,
      enum: ["broken", "full", "jammed", "dirty", "rejected_item", "fraud", "other"],
      required: [true, "Issue Type is Required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "dismissed"],
      default: "open",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
