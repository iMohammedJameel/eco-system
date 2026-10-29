const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getMonthlyStats,
  getMaterialStats,
  getTodayHourlyStats,
  getWeekDailyStats,
  getLeaderboard,
  getMachineForecasts,
} = require("../controllers/stats.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     tags: [Stats]
 *     summary: نظرة عامة (مستخدمون/ماكينات/معاملات/تدوير)
 *     responses:
 *       200: { description: مؤشرات الداشبورد الرئيسية }
 */
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getDashboardStats);

/**
 * @openapi
 * /dashboard/stats/monthly:
 *   get:
 *     tags: [Stats]
 *     summary: تجميع شهري لآخر 12 شهرًا (وزن/مبلغ/عدد)
 *     responses:
 *       200: { description: بيانات الرسم الشهري }
 */
router.get("/monthly", verifyToken, allowedTo("superAdmin", "operationsManager"), getMonthlyStats);

/**
 * @openapi
 * /dashboard/stats/materials:
 *   get:
 *     tags: [Stats]
 *     summary: تجميع حسب نوع المادة
 *     responses:
 *       200: { description: وزن/مبلغ لكل مادة }
 */
router.get("/materials", verifyToken, allowedTo("superAdmin", "operationsManager"), getMaterialStats);

/**
 * @openapi
 * /dashboard/stats/today-hourly:
 *   get:
 *     tags: [Stats]
 *     summary: إيداعات اليوم مجمّعة بالساعة (كل 24 ساعة)
 *     responses:
 *       200: { description: بيانات حقيقية لرسم "اليوم" }
 */
router.get("/today-hourly", verifyToken, allowedTo("superAdmin", "operationsManager"), getTodayHourlyStats);

/**
 * @openapi
 * /dashboard/stats/week-daily:
 *   get:
 *     tags: [Stats]
 *     summary: إيداعات آخر 7 أيام مجمّعة باليوم
 *     responses:
 *       200: { description: بيانات حقيقية لرسم "الأسبوع" }
 */
router.get("/week-daily", verifyToken, allowedTo("superAdmin", "operationsManager"), getWeekDailyStats);

/**
 * @openapi
 * /dashboard/stats/leaderboard:
 *   get:
 *     tags: [Stats]
 *     summary: المتصدرون حسب الوزن المُدوَّر
 *     parameters:
 *       - { name: limit, in: query, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { name: governorate, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: قائمة المتصدرين مع الترتيب }
 */
router.get("/leaderboard", verifyToken, allowedTo("superAdmin", "operationsManager"), getLeaderboard);

// تحليل تنبؤي — امتلاء الماكينات
/**
 * @openapi
 * /dashboard/stats/machine-forecasts:
 *   get:
 *     tags: [Stats]
 *     summary: تنبؤ امتلاء الماكينات (متوسط متحرك 14 يومًا)
 *     responses:
 *       200: { description: حالة الامتلاء المتوقعة لكل ماكينة }
 */
router.get("/machine-forecasts", verifyToken, allowedTo("superAdmin", "operationsManager"), getMachineForecasts);

module.exports = router;
