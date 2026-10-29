const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    // بريد التواصل — فريد ويُستخدم لتسجيل دخول الشريك في بوابة الشركاء
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true, // يسمح بقيم null للشركاء القدامى دون تعارض
    },
    contactPhone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
    governorate: { type: String, trim: true },
    discountOffers: [discountOfferSchema],
    // ═══ حساب دخول بوابة الشركاء ═══
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    // قفل الحساب بعد محاولات دخول فاشلة متكررة (نفس نمط الأدمن/المستخدم)
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// هاش كلمة المرور قبل الحفظ — نفس نمط User/Admin
partnerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

partnerSchema.methods.comparePassword = async function (matchedPassword) {
  if (!this.password) return false; // شريك قديم بدون كلمة مرور — لا دخول
  return await bcrypt.compare(matchedPassword, this.password);
};

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
