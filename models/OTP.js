const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
 email:{
    type:String,
    required: true,
 },
 otp:{
    type: String,
    required: true,
 },
 createdAt:{
    type: Date,
    default: Date.now(),
    expires: 5*60,
 }
});

// a function -> to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email, "verification email from studyNotion ", otp);
        console.log("Email sent Succesfully: ", mailResponse);
    }
    catch(error){
        console.log("error occured while sending emails", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports  = mongoose.model("OTP",OTPSchema);