
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';   //ye hmne existing user check krne ke liye import kiya h
import jwt from 'jsonwebtoken'

const generateRefereshAndAccessToken=async(userId)=>{  //ek function bnaya jo refreshToken or accessToken bnayga

    try {
        const user =await User.findById(userId) //yha phle jo bhi hm userID dalenge wo use dhundega database se
        const accessToken = user.generateAccessToken();  //jb hmne user naam ka instance bna liya User Schema ka to useke pss wha ke functions ka access aagya usi access ko use krke hmne accessToken or refresh Token Generate kra liye
        const refreshToken= user.generateRefreshToken();
        user.refreshToken=refreshToken //yha hmne User Schema ke referesh token mai refresh token daal diya kyuki wo hme database mai bhejna hai 
        await user.save({validateBeforeSave:false}) //yha hmne use save kra diya database mai {validat:false } ye isliye likha hai taki hme password ki zrurat na pde save krate time
        return {accessToken,refreshToken};

    } 
    catch (error) 
    {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
 // Code to register user
    //get user details
    //validation - not empty
    //check if user exist using email or name  
    //check for images, check for avatar
    //uplading image to cloudinary
    //create user object - create entry in db
    //remove password and refresh token from response
    //check user creation
    // return res
const registerUser = asyncHandler(async (req, res) => {
 
    const {userName,fullName,email,password} = req.body
     //agr form se ya json se data aya h toh req.body se access kr skte h
   
     if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }
   const existingUser = await User.findOne({$or:[{userName},{email}]})  //ye check krne ke liye h ki user already exist krta h ya nhi
   if(existingUser){
       throw new ApiError(409,"User already exists")
   }
   //req.files object me wo files hoti hain jo form se upload ki gayi hain. Ye object Multer middleware ke through populate hota hai.
//Optional Chaining (?.):

//Optional chaining (?.) ka use isliye kiya gaya hai taaki agar req.files ya avatar ya coverImages undefined ho toh error na aaye. Agar koi bhi part undefined ho, toh ye undefined return karega bina error throw kiye.
//Accessing File Paths:

//req.files?.avatar[0]?.path: Ye line avatar field ki pehli file ka path access kar rahi hai.
//req.files?.coverImages[0]?.path: Ye line coverImages  field ki pehli file ka path access kar rahi hai.

//Example Scenario
// Jab user avatar aur cover image upload karta hai,  toh files temporarily server par store hoti hain.  Ye lines uploaded files ke local file paths ko  extract karti hain taaki unhe aage process kiya ja sake, jaise ki Cloudinary par upload karna.

    //create user object
  const user = await User.create({
        fullName,
        email,
        password,
        userName,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Error while registering user")
    }
    return res.status(201).json(new ApiResponse(200,createdUser,"User registered successfully"))



}) 

const loginUser = asyncHandler(async (req, res) => {  
    const {email , userName , password} = req.body;  //hmne data leliya user form se

    if(!(userName || email)){  //ya to username dedo ya email
     throw new ApiError(400,"username or password required");
    }

    const user =await User.findOne({ //hm yha option dere hain ya to email ya username se login krlo
        $or:[{email}, {userName}]
    })

    if(!user){
        throw new ApiError(404,"user not found")
    }
    const validateUser=await user.isPasswordCorrect(password)  //ab hm yha password check krre hain databse se 
    if(!validateUser)
    {
        throw new ApiError(401,"User credentials are invalid");
    }

   const {accessToken,refreshToken}=await generateRefereshAndAccessToken(user._id) //user hmare pss tha yha loginUser mai usmae se hme _id nikalli jo mongodb deta hai hme apne aap  
    user.refreshToken=refreshToken;
    user.accessToken=accessToken;

    const options={  //ye hm isliye kre hain taki hmari cookien frontend wala modify na kr ske bss server se ho modify ho
        httpOnly:true,  
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options) 
    .json(
        new ApiResponse(200,{
            user:loginUser,accessToken,refreshToken
        },
        
            "user loggedin Successfully"
        
    )
    )

   
 })
 const logoutUser = asyncHandler(async(req,res)=>{  //ye logout ke liye bnare hain 
    // yha pr hmare pss user ki id ni hai upar hm user ka email password lere the usse hm nikal lre the lekin yha asia ni kr skte kyuki logout krte time hme pta hona chahiye kon login hai kyuki logout krte time hm user se form ni fill krwaskte phr user kisi ka bhi email daaldega or wo logout ho jayga 

    // to hme bnana pdega 1 middleware wo middleware bss logout ke time pr ni jo bhi protected routes honge hme wha kaam aayga jaise koi video upload krna koi post add krna etc  
       await User.findByIdAndUpdate(  
            req.user._id, // ab ye hmare pss aagya jo hmne middleware bnaya hai usse hmne req.user ke andr jo user login hai uska data daal diya hai
            {
                $set:{  //ye mongodb ka operator hai 
                    refreshToken:undefined  //yha hmne refresh token ko undifined kr diya
                }
            },
            {
                new:true // yha pr hme res jo milega usmai updated valu milegi 
            }
        )
        const options={ 
            httpOnly:true,  
            secure:true
        }
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User Logged Out"))
 })


    const refreshAccessToken = asyncHandler(async(req,res)=>{  
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
        }

       try {
         const decodedToken =   jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
         const user = await User.findById(decodedToken._id)
         if(!user){
             throw new ApiError(401,"Invalid Refresh Token ")
         }
          if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(401,"Refresh Token is expired or used")
          }
          const options = {
             httpOnly:true,
             secure :true
          }
        const {accessToken,newrefreshToken}= await  generateRefereshAndAccessToken(user._id)
 
         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newrefreshToken,options)
         .json(
             new ApiResponse(
                 200,
                 {accessToken,newrefreshToken},
                 "access Token Refreshed"
                 
             )
         )
       }
        catch (error) {
            throw new ApiError(401,error?.message || "invalid refresh Token")
       }

    })
     const changeCurrentPassword = asyncHandler(async(req,res)=>{
        const {oldPassword,newPassword,confirmPassword} = req.body
        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if(!isPasswordCorrect){
            throw new ApiError(400,"Password is invalid")
        }
        if(!(newPassword === confirmPassword)){
            throw new ApiError(400,"password does not match")
        }
        user.password= newPassword;
        await user.save({validateBeforeSave:false})

        return res
        .status(200)
        .json(new ApiResponse(200,{},"password change successfully"))
     })

     const getCurrentUser = asyncHandler(async(req,res)=>{
        return res
        .status(200)
        .json(200,req.user,"current user Fetched successfully")
     })

     const updateAccoutDetails = asyncHandler(async(req,res)=>{
        const {newUserName,newEmail,newFullName} = req.body
       
        const user = await User.findByIdAndDelete(
            req.user._id,
            {
                $set:{
                    fullName:newFullName,
                    email:newEmail
                }
            },
            {new:true} //isse update hone ke bdd info hmare pss aajati hai
        
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"account details updated successfully"))
     })

   
  
        

export {
        registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccoutDetails,
    
    }; 