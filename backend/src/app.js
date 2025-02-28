import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";  //iska kaam itna hai ki hm server se user ki cookies pr crud operations perform kr payien unko bss server hi read kr skta hai
const app = express()
app.use(cors({   // ye hmne isliye kra hai taki req kha se aaygi 
    origin:process.env.CORS_ORIGIN,   //hmne filhal sbko access derkha hai jaisa ki env file mai hai 

}))
app.use(express.json({  //yha pr hm json format data ko accept krenge jiski limit 16kb rhegi like hmne form bhara
    limit:"16kb"
}))

app.use(express.urlencoded({extended:true , limit :"16kb"}))  // yha hmne url se data accept kraa hai 

app.use(express.static("public"))    //ismai hm kcuh files wgera apne server pr store krte hain jisko koi bhi access kr skta hai 

app.use(cookieParser())

//routes
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users",userRouter)

export {app}