import mongoose from "mongoose";

const newListSchema = new mongoose.Schema({
    name:String,
    listData:[
        {
            name:String,
            savedDate:String,
            savedTime:String
        }
    ]
});

const NewList = mongoose.model("newLists",newListSchema);


export default NewList;