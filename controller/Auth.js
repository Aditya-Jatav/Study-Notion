const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { passwordUpdated } = require("../mail/template/passwordUpdate")
const Profile = require("../models/Profile");
require("dotenv").config();
// send OTP
exports.sendOTP = async(req,res)=>{
   try{
     // fetch email from request ki body
     const {email} = req.body;

    const checkUserPresent = await User.findOne({ email });

     // check if user is already exist
     if(checkUserPresent){
         return res.status(401).json({
             succuss:false,
             message:'User already registered',
         })
     }

    //  otp generate
    var otp = otpGenerator.generate(6, {
        // simple otp of numbers
        upperCaseAlphabets :false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log("OTP generated: ", otp);

    // check unique otp or not
    const result = await OTP.findOne({otp:otp});

    while(result){
        otp = otpGenerator(6,{
            upperCaseAlphabets :false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        result = await OTP.findOne({otp:otp});
    }
    const  otpPayload = {email, otp};
    // create an entry for otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    res.status(200).json({
        succuss:true,
        message:'OTP Sent Successfully',
        otp,
    })
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        succuss:false,
        message:error.message,
    })
   }
};

// signup
exports.signUp =async (req, res) =>{
    try{
        // data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                succuss: false,
                message: 'All fields are required',
            })
        }

        // password match krlo
        if(password !== confirmPassword){
            return res.status(400).json({
                succuss: false,
                message:'Password and confirmPassword value does not match, please try again',
            })
        }

        // check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message:'User is already registered',
            });
        }

        // find most recent OTP stored for user
        const response = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(response);
        // validate OTP
        if(response.length == 0){
            // OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP Not valid'
            })
        }
        else if(otp !== response[0].otp){
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message:'Invalid OTP',
            })
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password,10);
        
        // entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth : null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })

        // return response
        return res.status(200).json({
            success: true,
            message:'User is registered Successfully',
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered, Please try again',
        })
    }

}

// login
exports.login = async (req,res)=>{
    try{
        // get data from req body
        const {email, password} = req.body;
        // validation
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message:'All fields are required. please try again',
            });
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.status(401).json({
                success: false,
                message:'User is not registered, please signup first',
            });    
        }

        // generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const token = jwt.sign(
                { email: user.email, id: user._id, role: user.role },
                process.env.JWT_SECRET,
                {
                  expiresIn: "24h",
                }
              )
            user.token = token;
            user.password = undefined;

            // create cookie and send password
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in Succesfully',
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message:'Password is incorrect',
            })
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message:'Login Failure, please try again',
        });
    }
};

// Change Password
exports.changePassword = async (res, req)=>{
    //  get data from req body
    // get oldPassword, newPassword, confirmPassword
    // validation

    // update pwd in DB
    // send email - password updated
    //  return response
}