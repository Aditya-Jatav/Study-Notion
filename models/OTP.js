const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/template/emailVerificationTemplate");
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
        const mailResponse = await mailSender(email, "verification email from studyNotion ", emailTemplate(otp));
        console.log("Email sent Succesfully: to email",email, mailResponse);
    }
    catch(error){
        console.log("error occured while sending emails", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    console.log("New document saved to database");
    if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
    next();
})

module.exports  = mongoose.model("OTP",OTPSchema);