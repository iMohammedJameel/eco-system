/**
 * Coupon — كوبون خصم عند شريك (حلقة الاستبدال الاقتصادية)
 * المستخدم يستبدل رصيده بكوبون، والشريك يستلمه ويأكده
 */
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // كود فريد يُعرض كـ QR للمستخدم
    code: {
      type: String,
      required: [true, "Coupon code is Required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    // Snapshot للعرض وقت الإصدار (لا يتغير لو الشريك عدّل العرض)
    offer: {
      title: { type: String, default: "خصم" },
      discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
      discountValue: { type: Number, default: 0 },
      minSpend: { type: Number, default: 0 },
    },
    // كم نقطة دفع المستخدم مقابل الكوبون
    pointsCost: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["issued", "redeemed", "cancelled"],
      default: "issued",
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    redeemedAt: { type: Date, default: null },
    // الأدمن اللي أكد الاستبدال
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    // الشريك صاحب البوابة اللي أكد الاستبدال بنفسه (بوابة الشركاء الحقيقية)
    redeemedByPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
    },
  },
  { timestamps: true },
);

couponSchema.index({ user: 1, createdAt: -1 });
couponSchema.index({ partner: 1, status: 1 });
couponSchema.index({ status: 1, createdAt: -1 });

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
