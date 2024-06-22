const express = require("express");
const router = express.Router();


// course controller import 
const {
    createCourse,
    showAllCourses,
    getCourseDetails,   
} = require("../controller/Course");

// category controller import
const {
    showAllCategory,
    createCategory,
    categoryPageDetails,
} = require("../controller/Category");

// Section Controller
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controller/Section");

// Sub-Section Controller import
const {
    createSubSection,
    UpdateSubSection,
    deleteSubSection,
} = require("../controller/SubSection");


// Rating Controller Import
const {
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controller/RatingAndReview");

// importing middleware 
const {auth, isInstructor, isStudent, isAdmin} = require("../middleware/auth")

// course can only be created by instructor
router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);

router.get("/showAllCategories", showAllCategory);
router.get("/getCategoryPageDetails", categoryPageDetails);

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;