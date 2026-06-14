const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createUserSchema, updateUserSchema } = require("../controllers/validation/userValidation");

router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllUsers);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getUserById);
router.post("/", verifyToken, allowedTo("superAdmin"), validationSchema(createUserSchema), createUser);
router.put("/:id", verifyToken, allowedTo("superAdmin"), validationSchema(updateUserSchema), updateUser);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteUser);

module.exports = router;
