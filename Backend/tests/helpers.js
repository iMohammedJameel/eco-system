/**
 * إعداد بيئة الاختبارات — قاعدة بيانات اختبار معزولة + بيانات أساسية
 */
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Machine = require("../models/Machine");
const Partner = require("../models/Partner");
const Pricing = require("../models/Pricing");
const Achievement = require("../models/Achievement");

const TEST_URI =
  process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/ecocycle_test";

let app = null;

async function setupApp() {
  if (app) return app;
  process.env.NODE_ENV = "test"; // يعطّل rate limiting أثناء الاختبارات المكثفة
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
  app = require("../app");
  return app;
}

async function connectDB() {
  await mongoose.connect(TEST_URI);
  await Promise.all(
    Object.values(mongoose.connection.models).map((M) => M.deleteMany({})),
  );
}

async function seedBasics() {
  const admin = await Admin.create({
    username: "تست أدمن",
    email: "test-admin@ecocycle.com",
    password: "admin123456",
    role: "superAdmin",
  });

  const user = await User.create({
    username: "مستخدم تست",
    email: "test-user@ecocycle.com",
    phoneNumber: "01000000001",
    password: "user123456",
    balance: 100,
    totalDeposits: 10,
  });

  const machine = await Machine.create({
    name: "ماكينة تست",
    location: "وسط البلد",
    governorate: "القاهرة",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    status: "active",
    fillPercentage: 10,
  });

  const partner = await Partner.create({
    name: "شريك تست",
    category: "supermarket",
    governorate: "القاهرة",
    discountOffers: [
      {
        title: "خصم 10%",
        discountType: "percentage",
        discountValue: 10,
        minSpend: 100,
        isActive: true,
      },
    ],
  });

  await Pricing.create([
    { materialType: "plastic", pricePerKg: 5, currency: "EGP", isActive: true },
    { materialType: "paper", pricePerKg: 2, currency: "EGP", isActive: true },
  ]);

  await Achievement.create([
    {
      name: "أول خطوة",
      description: "أول إيداع",
      icon: "sprout",
      metric: "depositsCount",
      threshold: 1,
      xpReward: 5,
      badgeColor: "#a9c7b6",
    },
    {
      name: "نشط",
      description: "20 كجم",
      icon: "leaf",
      metric: "totalDeposits",
      threshold: 20,
      xpReward: 25,
      badgeColor: "#5f9d78",
    },
  ]);

  return { admin, user, machine, partner };
}

async function closeDB() {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.connection.close();
}

module.exports = { setupApp, connectDB, seedBasics, closeDB, TEST_URI };
