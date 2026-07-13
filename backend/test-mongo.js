import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("MongoDB Test Successful");
    process.exit();
})
.catch(err=>{
    console.log(err.message);
});
