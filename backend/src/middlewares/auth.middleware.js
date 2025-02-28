import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from 'jsonwebtoken';
// Ye middleware authentication ke liye hai
// Isse hum check karenge ki user logged in hai ya nahi
// Protected routes ko access karne se pehle ye middleware chalega
export const verifyJWT = asyncHandler(async(req,res,next)=>{
try {
        // Token do jagah se mil sakta hai:
        // 1. Cookies se - jab browser se request aati hai
        // 2. Headers se - jab mobile app ya Postman se request aati hai
        // Bearer keyword ko replace kar denge empty string se
     const token =    req.cookies?.accessToken || req.header ("Authorization")?.replace("Bearer ","")
        // Agar token nahi mila to unauthorized error throw karo
        // Iska matlab user login nahi hai
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
        // Ab token ko verify karenge using JWT
        // Process.env se secret key lenge jo .env file mei hai
        // Agar token valid nahi hai ya expire ho gaya hai to error aayega
        const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        //decodeToken ke pss ab hmari unfo hai sari jo hmne user-models mai accessToken ko do thin 
        // Token verify ho gaya, ab user ko database mei dhundenge
        // Select mei minus ka matlab ye fields nahi chahiye
        // Password aur refreshToken security ke liye hata diye    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        // Agar user nahi mila to error
        // Ho sakta hai token valid ho par user delete ho gaya ho

        if(!user){
            //Todo discuss about frontend
            // yha hm btt krenge access or refresh token ke bare mai 
            //access token km time ke liye hota hai or refresh token zyada time ke liye 
            //access token ko hm khi store ni krate 
            //refresh token user or data base mai hota hai
            // suppose kriye user ka access token invalidate hogya hai to phr user ke pss 401 req aaygi ki aapka access expire hogya to frontend wala banda 1 endpoint hit kra dega taki user ko khud brr brr login na krna pde or us end point se uska access token refresh ho jayga mtlb 1 new access token aajayga ab user ke pss  
            // to ab ye kaam kaise hoga hm us endpoint ke andr  1 refreshToken bhejenge database mai jisse user verify hoga phr  or hame access token mil jayga or dubara se session start ho jayga
            
            throw new ApiError(401,"Invalid Access Token")
        } 
        // User mil gaya to usko request object mei add kar denge
        // Taki aage ke route handlers mei user ka data available rahe
    
        req.user=user;
        // next() ka matlab hai ki aage ke middleware ya route handler ko call karo
        next()
} catch (error) {
    throw new ApiError(401,error?.message|| "Invalid access token")
}
})