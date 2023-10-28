import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const username = process.env.USERNAME_DB;
const password = process.env.PASSWORD_DB;

// paroname1125

// const dbUrl = 'mongodb://0.0.0.0:27017/mylocaltodo';  // URI for local mongodb


const dbUrl = "mongodb+srv://"+username+":"+password+"@todolist.zms8d3u.mongodb.net/?retryWrites=true&w=majority"; // URI for live server mongodb

const mongodbConnection = async ()=>{
    try {
        await mongoose.connect(dbUrl, {useNewUrlParser:true});
        console.log("mongoDB connect successfully");
    } catch (error) {
        console.log("Error while mongoDB connection",error);
    }
}


export default mongodbConnection;
