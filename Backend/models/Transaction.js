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
      enum: ["bank", "mobile_wallet", "coupon"],
    },
    accountNumber: {
      type: String,
    },
    // علم كشف الاحتيال — يرفع تلقائيًا عند نشاط مشبوه
    suspicious: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// فهارس مركّبة للمسارات الساخنة:
// - (user, createdAt): كشف الاحتيال (نافذة 15 دقيقة لكل مستخدم)
//   + "معاملاتي" (فرز بالأحدث) — كان الاعتماد على index الـ user وحده
//   يجبر MongoDB على fetch + sort لكل استعلام
// - (machine, createdAt): تجميع توقعات الامتلاء (fillForecast يعمل aggregate
//   لكل ماكينة على مدى 14 يومًا)
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ machine: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
