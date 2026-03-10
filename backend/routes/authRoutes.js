const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  forgotPassword,
  upadtePassword,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verify-email", resendVerificationEmail);
router.post("/refresh", refreshToken);
router.post("/forgotPassword", forgotPassword);
router.post("/updatePassword", upadtePassword);

module.exports = router;
