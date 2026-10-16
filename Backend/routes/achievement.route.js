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

module.exports = router;
