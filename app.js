import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import bcrypt  from "bcrypt";
import _ from "lodash";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import mongodbConnection from "./database/db.js";
import { MainFormate } from "./database/models/newList.js";
import { User } from "./database/models/userData.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static("public"));

// session setup
app.use(session({
    secret: '?3Yq7v+m6>Bht',
    resave: false,
    saveUninitialized: true,
}));
app.use(cookieParser());

// Mongo DB connection!
mongodbConnection();


// SIGN IN ROUTES OF form

app.post("/user/signIn", async (req, res) => {
    const userName = _.capitalize(req.body.userName);
    const userPassword = req.body.userPassword;

    const accountExist = await User.findOne({user : userName});

    if (!accountExist) {
            // bcrypt setup
    const saltRound = 10;

    bcrypt.hash(userPassword , saltRound, async (err , hash)=>{

        const userInfoObject = {
            user: userName,
            password: hash
        };
    
        const userData = new User(userInfoObject);
        await userData.save();

        req.session.userDetail = userInfoObject;
    });

    res.render("login");
    }else{
        res.render("signUp",{
            account: "User already exist!"
        })
    }

})

app.post("/user/login", async (req, res) => {

    const userName = _.capitalize(req.body.userName);
    const userPassword = req.body.userPassword;

    const userDetail = await User.findOne({ user: userName });

    if (userDetail && !undefined) {

        bcrypt.compare(userPassword , userDetail.password, (err,result)=>{

            if (result === true) {
    
                req.session.userDetail = userDetail;
                res.redirect("/");
    
            } else if(result === false) {
    
                res.render("login", {
                    password:"incorrect password, please write correct password"
                });
    
            }
        })

    }else {

        res.render("login", {
            userName:"User not exist"
        });
    }

})

app.post("/signIn/form", (req, res) => {
    res.render("signUp");
})
app.post("/login/form", (req, res) => {
    res.render("login");
})


app.get("/", async (req, res) => {

    // Date and time setup
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() > 12 ? today.getHours() - 12 : today.getHours() : "0" + today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes());

    // getting value from userDetail state
    const userDetail = req.session.userDetail;

    // parrent if to check user login 
    if (userDetail !== null && userDetail !== undefined && typeof userDetail === 'object') {

        // get full document from DB by id
        const userCompleteList = await MainFormate.findOne({ _id: userDetail.user });

        // child if > checking if user have no any inbuild document then it will create
        if (!userCompleteList) {

            const item1 = new MainFormate({

                _id: userDetail.user,
                main: [{
                    name: "Todo list",
                    listData: [
                        {
                            name: "...",
                            savedDate: dayName,
                            savedTime: time

                        }
                    ]
                }]
            });

            await item1.save();
            res.redirect("/");


            // child else >
        } else {

            // if user have document then this will render to ejs
            res.render("index", {
                listTitle: _.capitalize(userCompleteList.main[0].name),
                array: userCompleteList.main[0].listData,
                mainArray: userCompleteList.main,
                publishDate: userCompleteList.main[0].listData[0].savedDate,
                publishTime: userCompleteList.main[0].listData[0].savedTime
            })
        }

        // parrent else when user is not loggen in then to redirect to sign in page  
    } else {
        res.render("signUp");
    }

})

// to stop request went through this route
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

app.post("/create", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const createItem = _.capitalize(req.body.newList);
    const createDate = req.body.date;
    const createTime = req.body.time;

    // get full document from DB having a unique user id and a listTitle
    const userCompleteList = await MainFormate.find({
        _id: userDetail.user,
        "main.name": createItem
    });

    // simple js object
    const newListObject = {

        name: createItem,
        listData: [
            {
                name: "...",
                savedDate: createDate,
                savedTime: createTime
            }
        ]
    };

    // check if user have no listTitle in document 
    if (userCompleteList.length === 0) {

        // push created simple object to document
        await MainFormate.findOneAndUpdate({ _id: userDetail.user }, { $push: { "main": newListObject } });

    }
    res.redirect("/" + createItem);

})

app.get("/:newList", async (req, res) => {

    // getting data from session 
    const userDetail = req.session.userDetail;

    const listName = req.params.newList;

    // to get document without array brackets "[]" (findOne)
    const userCompleteList = await MainFormate.findOne({ _id: userDetail.user, "main.name": listName });

    // to get full array with brackets "[]" (find)
    const userCompleteFullArray = await MainFormate.find({ _id: userDetail.user, "main.name": listName });

    // function to get seleted object by listTitle
    const getDynamicObj = (arra) => {
        return arra.find(item => item.name === listName)
    }

    //  check if listTitle in URL is correct by finding that listTitle from DB if do not get Ans then
    if (userCompleteList !== null && userCompleteList.length !== 0) {

        res.render("index.ejs", {
            listTitle: getDynamicObj(userCompleteList.main).name,
            array: getDynamicObj(userCompleteList.main).listData,
            mainArray: userCompleteFullArray[0].main,
            publishDate: getDynamicObj(userCompleteList.main).listData[0].savedDate,
            publishTime: getDynamicObj(userCompleteList.main).listData[0].savedTime
        });

        //  check if listTitle in URL is NOT correct
    } else {
        res.render("index.ejs", {
            listTitle: "",
            array: [],
            mainArray: [],
            publishDate: "",
            publishTime: ""
        });
    }

})

app.post("/", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const listName = req.body.listTitle;
    const newItem = req.body.new_note;

    // query to delete a particular or specific listTile object by its name
    await MainFormate.updateOne({ _id: userDetail.user, "main.name": listName }, { $push: { "main.$.listData": { "name": newItem } } }); // Push the new object into the listData array

    res.redirect("/" + listName)

});

app.post("/delete", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const itemId = req.body.delete;
    const listName = req.body.listTitle;

    // query to delete a particular or specific listTile object by its name
    await MainFormate.updateOne({ _id: userDetail.user, "main.name": listName }, { $pull: { "main.$.listData": { _id: itemId } } }); // Pull the object by its _id

    res.redirect("/" + listName);

});

app.post("/deleteOneList", async (req, res) => {
    // Date and time setup
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() > 12 ? today.getHours() - 12 : today.getHours() : "0" + today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes());

    // get data from session state
    const userDetail = req.session.userDetail;

    const listName = req.body.listName;

    // check if listTitle is NOT selected "Todo list" which comes to delete
    if (listName !== "Todo list") {

        // query to delete a particular or specific listTile object by its name
        await MainFormate.updateOne({ _id: userDetail.user }, { $pull: { "main": { name: listName } } });

        // check if listTitle which is selected is equal to "Todo list"
    } else if (listName === "Todo list") {

        // query to delete a all the items of "Todo list" object by its name
        await MainFormate.updateOne({ _id: userDetail.user }, { $pull: { "main.0.listData": { name: { $ne: "..." } } } });

        // query to set new updated Date and Time in Default todolist listTitle
        await MainFormate.updateOne({ _id: userDetail.user, 'main.name': 'Todo list', 'main.listData.name': '...' }, { $set: { 'main.$[outer].listData.$[inner].savedDate': dayName, 'main.$[outer].listData.$[inner].savedTime': time } }, { arrayFilters: [{ 'outer.name': 'Todo list' }, { 'inner.name': '...' }] });

    }

    res.redirect("/");

})

app.post("/d/eleteAll", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const searchQuery = req.body.deleteAll;

    // check to confirm from client side to delete All listTiltes
    if (searchQuery === "delete") {

        // query to delete full document
        await MainFormate.deleteOne({ _id: userDetail.user });

        res.redirect("/");

    }

})

app.get('/user/logout', (req, res) => {

    res.clearCookie('connect.sid');
    res.render("signUp");
});


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
