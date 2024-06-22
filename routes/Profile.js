const express = require("express");
const router = express.Router();

const {auth} = require("../middleware/auth");

const {
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    // getEnrolledCourse,
} = require("../controller/Profile");

// delete user account
router.delete("/deleteProfile", deleteAccount);
router.put("/updateProfile", auth,updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
// get Enrolled Course
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;
