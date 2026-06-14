const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    materialType: {
      type: String,
      enum: ["plastic", "glass", "cardboard", "paper"],
    },
    weightKg: {
      type: Number,
      default: 0,
    },
    itemsCount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    withdrawalMethod: {
      type: String,
      enum: ["bank", "mobile_wallet"],
    },
    accountNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
