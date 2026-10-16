const express = require("express");
const router = express.Router();
const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueStats,
} = require("../controllers/issue.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  createIssueSchema,
  updateIssueSchema,
} = require("../controllers/validation/issueValidation");

// Admin views + stats
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllIssues);
router.get("/stats", verifyToken, allowedTo("superAdmin", "operationsManager"), getIssueStats);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getIssueById);

// Admin update (status, priority, notes) + delete
router.put(
  "/:id",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(updateIssueSchema),
  updateIssue,
);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteIssue);

// User-facing creation endpoint (kept here for the admin app to test if needed)
router.post(
  "/",
  verifyToken,
  allowedTo("user", "superAdmin", "operationsManager"),
  validationSchema(createIssueSchema),
  createIssue,
);

module.exports = router;
