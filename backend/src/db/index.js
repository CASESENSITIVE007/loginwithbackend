
import mongoose from "mongoose";
import { Db_name } from "../constants.js";


const connectDB = async()=>{
    try {
      
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${Db_name}`)
        console.log(`\n MongoDb connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO_DB connection error",error)
        process.exit(1);
    }
}

export default connectDB;