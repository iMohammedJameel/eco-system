const express = require("express");
const router = express.Router();
const {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require("../controllers/achievement.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  createAchievementSchema,
  updateAchievementSchema,
} = require("../controllers/validation/achievementValidation");

router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllAchievements);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getAchievementById);
router.post(
  "/",
  verifyToken,
  allowedTo("superAdmin"),
  validationSchema(createAchievementSchema),
  createAchievement,
);
router.put(
  "/:id",
  verifyToken,
  allowedTo("superAdmin"),
  validationSchema(updateAchievementSchema),
  updateAchievement,
);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteAchievement);


// ═══════════ توثيق Swagger — الإنجازات ═══════════
/**
 * @openapi
 * /dashboard/achievements:
 *   get:
 *     tags: [Achievements]
 *     summary: كل الإنجازات (شارات + XP)
 *     responses:
 *       200: { description: قائمة الإنجازات }
 */
/**
 * @openapi
 * /dashboard/achievements:
 *   post:
 *     tags: [Achievements]
 *     summary: إنشاء إنجاز (superAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, threshold]
 *             properties:
 *               title: { type: string }
 *               type: { type: string, enum: [deposits_count, total_weight, streak, level] }
 *               threshold: { type: number }
 *               xpReward: { type: number }
 *     responses:
 *       201: { description: تم الإنشاء }
 */
/**
 * @openapi
 * /dashboard/achievements/{id}:
 *   put:
 *     tags: [Achievements]
 *     summary: تعديل إنجاز (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
/**
 * @openapi
 * /dashboard/achievements/{id}:
 *   delete:
 *     tags: [Achievements]
 *     summary: حذف إنجاز (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
