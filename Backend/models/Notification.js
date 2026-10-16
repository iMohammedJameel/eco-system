const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is Required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is Required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["earnings", "machine_alert", "promo", "system", "issue"],
      default: "system",
    },
    // "all" = broadcast to all users; otherwise ObjectId of a specific user
    recipient: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Recipient is Required (userId or 'all')"],
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
