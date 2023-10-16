import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import mongodbConnection from "./database/db.js";
import NewList from "./database/models/newList.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));


// Mongo DB connection!
mongodbConnection();


app.get("/" , async(req , res)=>{

    const timeElapsed = Date.now(); 
    const today = new Date(timeElapsed); 
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() : "0"+today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0"+today.getMinutes()) ;

    const allItems = await NewList.find();  

    if (allItems.length === 0) {
        const item1 = new NewList({
            name:"Todo list",
            listData:[
                {
                    name:"...",
                    savedDate:dayName,
                    savedTime:time

                }
            ]
        });
        await item1.save();
        res.redirect("/");
    }else{
        // console.log(allItems[0].listData[0].name);
        res.render("index.ejs" , {
            listTitle:_.capitalize(allItems[0].name),
            array:allItems[0].listData,
            mainArray:allItems,
            publishDate:allItems[0].listData[0].savedDate,
            publishTime:allItems[0].listData[0].savedTime
        })
    }

})


app.get("/favicon.ico",(req,res)=>{
    res.status(204).end();
});

app.post("/create",async(req,res)=>{
    const createItem = _.capitalize(req.body.newList);
    const createDate = req.body.date;
    const createTime = req.body.time;

    const listInDb = await NewList.findOne({name:createItem});
    // const newFull = await NewList.find();


    const newListObject = new NewList({
        name:createItem,
        listData:[
            {
                name:"...",
                savedDate:createDate,
                savedTime:createTime
            }
        ]
    });
    if (!listInDb) {
        await newListObject.save();
    }
    res.redirect("/"+createItem);

})

app.get("/:newList",async(req,res)=>{

    const listName = req.params.newList;
    const listInDb = await NewList.findOne({name:listName});
    const newFull = await NewList.find();

    if (listInDb) {
        res.render("index.ejs",{
            listTitle:listInDb.name,
            array:listInDb.listData,
            mainArray:newFull,
            publishDate:listInDb.listData[0].savedDate,
            publishTime:listInDb.listData[0].savedTime
        });
    }else{
        res.render("index.ejs",{
            listTitle:"",
            array:[],
            mainArray:[],
            publishDate:"",
            publishTime:""
        });
    }
    // console.log(listInDb.listData[0].savedDate);
    // console.log(listInDb); 
    // console.log(listInDb.listData[0].savedDate);


})

app.post("/" , async (req , res)=>{

    const listName = req.body.listTitle;
    const newItem = req.body.new_note;

    await NewList.findOneAndUpdate({name:listName}, {$push: {"listData" :{"name" : newItem } } });

    res.redirect("/"+listName)
    
});

app.post( "/delete" ,async (req,res)=>{
    const itemId = req.body.delete;
    const listName = req.body.listTitle;
    
    await NewList.updateOne({name:listName},{$pull:{listData:{_id:itemId}}});
    res.redirect("/"+listName);

});

app.post("/deleteOneList",async (req,res)=>{
    const listName = req.body.listName;
    
    await NewList.deleteOne({name:listName});
    res.redirect("/");
    
})

app.post("/d/eleteAll",async (req,res)=> {
    const searchQuery = req.body.deleteAll;
    if (searchQuery === "delete") {
        await NewList.deleteMany();
        res.redirect("/");
    }
})

app.listen( port , ()=>{
    console.log(`Server is running on ${port}`);
})