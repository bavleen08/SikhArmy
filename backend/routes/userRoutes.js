const express = require("express");

const router = express.Router();

const {
    sendRegisterOTP,
    verifyRegisterOTP,
    sendLoginOTP,
    verifyLoginOTP,
    getUsers,
    getMyProfile
} = require("../controller/userController");

const {
    protect,
    admin
} = require("../middleware/userMiddleware");

// Registration
router.post("/register-send-otp", sendRegisterOTP);
router.post("/register-verify-otp", verifyRegisterOTP);

// Login
router.post("/login-send-otp", sendLoginOTP);
router.post("/login-verify-otp", verifyLoginOTP);

// Logged-in user's profile
router.get("/me", protect, getMyProfile);

// Admin
router.get("/users", protect, admin, getUsers);

module.exports = router;