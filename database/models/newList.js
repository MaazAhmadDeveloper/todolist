import mongoose from "mongoose";

const mainFormateSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true
        },
        main: [{
            name: String,
            listData: [
                {
                    name: String,
                    savedDate: String,
                    savedTime: String
                }
            ]
        }]
    }
);

const MainFormate = mongoose.model("mainFormates",mainFormateSchema);

export {MainFormate};