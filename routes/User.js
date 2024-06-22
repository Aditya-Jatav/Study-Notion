const express = require("express");
const router = express.Router();

const {
    login,
    signUp,
    sendOTP,
    changePassword,
} = require("../controller/Auth");
const {
    resetPasswordToken,
    resetPassword,
} = require("../controller/ResetPassword");

const {auth} = require("../middleware/auth");

// Routes  for login, signup and authantication
router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/changepassword", auth, changePassword);

router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;
