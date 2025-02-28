// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import {app} from "./app.js";
// import express from "express";
import connectDB from "./db/index.js";
// const app = express();
dotenv.config({
    path:'./.env'
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at ${process.env.PORT}`);
        
    })
}).catch((err)=>{
    console.log("Connection failed",err)
})  