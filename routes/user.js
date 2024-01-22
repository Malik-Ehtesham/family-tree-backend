const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const userController = require("../controllers/user");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.get("/", authController.protect, userController.getSingleUser);

module.exports = router;
