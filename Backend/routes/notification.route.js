const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notification.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  createNotificationSchema,
  updateNotificationSchema,
} = require("../controllers/validation/notificationValidation");

router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllNotifications);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getNotificationById);
router.post(
  "/",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(createNotificationSchema),
  createNotification,
);
router.put(
  "/:id",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(updateNotificationSchema),
  updateNotification,
);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteNotification);

module.exports = router;
