const express = require("express");
const app = express();

const Operations = require("./auth.operation");

const router = express.Router();

router.post("/login", Operations.login);
router.post("/register", Operations.register);
router.post('/forgot-password', Operations.forgotPassword);
router.post('/verify-otp', Operations.verifyOTP);
router.post("/resend-otp", Operations.resendOTP)
router.post('/reset-password', Operations.resetPassword);
router.post("/logout", Operations.logout)

module.exports = router;