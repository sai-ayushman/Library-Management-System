import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName: "MERN_STACK_LIBRARY_MANGEMENT_SYSTEM",
    }).then(res=>{
        console.log("Databse Connected Sucessfully");
        
    }).catch(err=>{
        console.log("Error Connecting To Databse ",err);
        
    })
}