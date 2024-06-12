const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) =>{
    try{
        // extract token
        const token = req.cookies.token
                        || req.body.token 
                        || req.header("Authorisation").replace("Bearer", "");

        //if token missing then return response
        if(!token){
            return res.status(401).json({
                success: true,
                message : "Token is missing",
            });
        }
        
        // verify the token
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            // verification
            return res.status(401).json({
                success: true,
                message : 'token is invalid',
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        })
    }
}