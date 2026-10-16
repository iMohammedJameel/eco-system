const express = require("express");
const router = express.Router();
const {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} = require("../controllers/partner.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createPartnerSchema, updatePartnerSchema } = require("../controllers/validation/partnerValidation");

// Admin only — partner management is restricted
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllPartners);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getPartnerById);
router.post("/", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(createPartnerSchema), createPartner);
router.put("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(updatePartnerSchema), updatePartner);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deletePartner);

module.exports = router;
