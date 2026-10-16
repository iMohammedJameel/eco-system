const express = require("express");
const router = express.Router();
const {
  getAllPricing,
  getPricingById,
  createPricing,
  updatePricing,
  deletePricing,
} = require("../controllers/pricing.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createPricingSchema, updatePricingSchema } = require("../controllers/validation/pricingValidation");

// Admin only — pricing is operational configuration
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllPricing);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getPricingById);
router.post("/", verifyToken, allowedTo("superAdmin"), validationSchema(createPricingSchema), createPricing);
router.put("/:id", verifyToken, allowedTo("superAdmin"), validationSchema(updatePricingSchema), updatePricing);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deletePricing);

module.exports = router;
