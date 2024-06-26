const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo } = require("mongoose");

// createRating
exports.createRating = async (req, res) =>{
    try{
    
        // get user id
        const userId  = req.user.id;
        // fetchdata from req body
        const {rating, review, courseId} = req.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                        studentsEnlrolled:{$elemMatch: {$eq : userId}},
                                    }
        );

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Stuednt is not enrolled in the course',
            });
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                        user: userId,
                                        course: courseId,
                                        });
        
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
            })
        }
        // create  rating and review
        const ratingAndReviews = await RatingAndReview.create({
                                        rating, review,
                                        course: courseId,
                                        user: userId,
        });

        // update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                {
                                    $push:{
                                        ratingAndReviews: ratingAndReviews,
                                    }
                                },
                                {new : true}
        );
        console.log(updatedCourseDetails);
        // return res
        return res.status(200).json({
            success: true,
            message:"Rating and Review created Successfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// getAverageRating

exports.getAverageRating = async (req, res) =>{
    try{
        // get course ID
        const courseId = req.body.courseId;
        // calculate avg rating

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    // courseId starting me string thi humne usko object me convert kr diya
                    course: new mongoose.Type.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null, //hume jb koi grouping ka base pta nhi tha to humne null set krke usko 1 group me wrap kr diya
                    averageRating :{$avg: "$rating"},
                }
            }
        ])

        // return rating
        if(result.length >0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating, //aggregate function array return krra h to values 0 index pr store h to usko vha se returm krra liya
            });
        }

        // if no rating/review exist
        return res.status(200).json({
            success: true,
            message:'Average rating is 0, no rating given till now'
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// getAllRatingAndReview
exports.getAllRating = async (req, res) =>{
    try{
        const allReview = await RatingAndReview.find({})
                                                .sort({rating:"desc"})
                                                .populate({
                                                    path: "user",
                                                    select: "firstName lastName email image",
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName",
                                                })
                                                .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data: allReview,

        })  ;                                      
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}