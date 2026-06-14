const express = require("express");
const router = express.Router();
const { getAllMachines, getMachineById, createMachine, updateMachine, deleteMachine } = require("../controllers/machine.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createMachineSchema, updateMachineSchema } = require("../controllers/validation/machineValidation");

// Users and admins can view machines
router.get("/", verifyToken, getAllMachines);
router.get("/:id", verifyToken, getMachineById);

// Admin only
router.post("/", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(createMachineSchema), createMachine);
router.put("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(updateMachineSchema), updateMachine);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteMachine);

module.exports = router;
