import mongoose,{Schema} from "mongoose";   
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, 
        
    },
    fullName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
        
    },
 
    password:{
        type:String,
        required:[true,"password is required"],


    },
    refreshToken:{
        type:String,

    }

},
{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); //yye hamne isliye lgaya hai 
    // taki hm koi bhi cheezz update hone pr ye password wali field na run krien bkle 
    // check krien agr ye modiy ni hua to return krdo otherqise run kro 
    this.password=await bcrypt.hash(this.password,10)
    next()
})



//pre is a middleware jaise hi aapka data save hone jara hoga just
//  usse phle kuch krdo uske liye use hota hai

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password) //password:user password //this.password:encrypted password
}
//ye hmne 1 custom method define kra hai jo ki password check krra hai 

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,   //yha hm bss id isliye rkhre hain kyuki ye brr brr refresh hota hai
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User = mongoose.model("User",userSchema)

//jwt 1 chabi ki trh hai 
// ye kaam aise krta hai ki jiske pss bhi ye hoga usko hm deta bhej denge