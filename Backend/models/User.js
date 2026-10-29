const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username Must Be Required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email Must Be Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number Must Be Required"],
      unique: true, // رقم واحد = حساب واحد (نقطة استلام أموال الـ PWA)
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password Must Be Required"],
      minlength: 6,
      select: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalDeposits: {
      type: Number,
      default: 0,
    },
    // الإنجازات المفتوحة (يديرها محرك الإنجازات)
    achievements: [
      {
        achievement: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    // قفل الحساب بعد محاولات دخول فاشلة متكررة
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
    level: {
      type: String,
      enum: ["beginner", "active", "good", "excellent"],
      default: "beginner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Create Pre Hook (Mongoose 9 — next is no longer needed for async hooks)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// تقريب الحقول المالية لخانتين عند القراءة — منع أخطاء دقة الفاصلة العائمة
// (مثل 143.54000000000002) من الظهور في أي endpoint أو واجهة
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    if (typeof ret.balance === "number") ret.balance = Math.round(ret.balance * 100) / 100;
    if (typeof ret.totalDeposits === "number") ret.totalDeposits = Math.round(ret.totalDeposits * 100) / 100;
    return ret;
  },
});

// Create Method Compare Password
userSchema.methods.comparePassword = async function (matchedPassword) {
  return await bcrypt.compare(matchedPassword, this.password);
};

// Create Model
const User = mongoose.model("User", userSchema);

// Export Module
module.exports = User;
