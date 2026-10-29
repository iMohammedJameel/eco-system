const mongoose = require("mongoose");

/**
 * QR Session — short-lived token tying a user to a specific machine
 * for one recycling deposit. Auto-expires after 5 minutes via TTL index.
 */
const qrSessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// TTL — MongoDB auto-deletes documents when expiresAt < now
qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const QRSession = mongoose.model("QRSession", qrSessionSchema);

module.exports = QRSession;
