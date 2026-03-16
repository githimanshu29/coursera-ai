import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect=async(req,res,next)=>{
    try {
        let token;
       /*
        HTTP HEADER

        Host: localhost:5001
        Content-Type: application/json
         Authorization: Bearer eyJhbGci... 
        
         🔥🔥🔥🔥 if token is once sent by client it means obviously user logged in once, this is access token
        */


        if(
            // this token is send by client ->  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

            req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Not authorized, token missing"
            })
        }
        

        const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET);


        const user = await User.findById(decoded.userId).select("-password -refreshToken");

        if(!user){
            return res.status(401).json({
                success:false,
                message:"user not found, Invalid Token"
            })
        }

        req.user=user;// now request contains full user and can given to next middlewares
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token invalid or expired",
            error: error.message,
          });
        
    }
}