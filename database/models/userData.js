import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    user : String,
    password : String
});

const User = mongoose.model("Users",UserSchema);

export {User};