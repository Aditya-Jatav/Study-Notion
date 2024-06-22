const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
// const {courseEnrollmentEmail} = require("../mail/template/courseEnrollmentEmail");
const {default:mongoose} = require("mongoose");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) =>{
    // get courseId and UserID
    const {course_id} = req.body;
    const userId = req.user.id;
    // validation
    // valid courseID
    if(!course_id){
        return res.json({
            success: false,
            message: 'Please provide valid course ID',
        });
    } 
    // valid courseDetails
    let course;
    try{ 
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success: false,
                message: 'Could not find the course',
            });
        }
        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(!course.studentsEnlrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message: 'Student is already enrolled',
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    // order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency,
        reciept: Math.random(Date.now()).toString(),
        notes:{
            //courseId, userId is sharing because for  match signature and authrize we need these
            courseId : course_id,
            userId, 
        }
    };

    try{
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        //return res
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDesciption :  course.courseDesciption,
            thumbnail : course.thumbnail,
            orderId:paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,

        }) 
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: "Could not initate order",
        })
    }
 
}


exports.verifySignature = async (req, res) =>{
    const webhookSecret = "123456789";

    const signature = req.header("x-razorpay-signature");
    // razorpay apni secret key hash krke bhejga but hmari key normal string h to dono match krne ke liye hume apni key ko bhi hash krna hoga
    // hmac -> hashed based message authantication code
    //  hmac => 1. hashing algo     2.secret key 
    //  sha -> secure hash algorithm
    // sha256 is type of hashing algo 
    const shasum = crpto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
                // fulfill the action

                // find the course and enroll the student in it
                const enrolledCourse = await Course.findByIdAndUpdate(
                                                {_id:courseId},
                                                {$push:{studentsEnrolled: userId}},
                                                {new: true},
                );

                if(!enrolledCourse){
                    return res.status(500).json({
                        success: false,
                        message:"Course not Found",
                    })
                }
                console.log(enrolledCourse);

                // find the student and add the course to their list enrolled courses me
                const enrolledStudent = await User.findOneAndUpdate(
                                                    {_id: userId},
                                                    {$push : {courses: courseId}},
                                                    {new : true},
                );

                console.log(enrolledStudent);

                // mail send krdo confirmation vala
                const emailResponse = await mailSender(
                                            enrolledCourse.email,
                                            "Congratulations from CodeHelp",
                                            "Congratulation you arem onboarded into new CodeHelp Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    success: true,
                    message:"Signature Verified and course added",
                });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            }) 
        }
    }
    else{
        return res.status(400)({
            success: false,
            message:"Invalid  request",
        })
    }
}
   