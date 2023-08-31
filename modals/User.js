const mongoose = require('mongoose');
//const { roles } = require('../config/constant');
const bcrypt = require("bcrypt");
//const session = require("express-session");

//"An error occured but where exactly"
const UserSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
         
        },
        lastName:{
            type: String,
            required: true,
        },
        userName:{
            type: String,
            required: true,
            unique: true,
        },
        country:{
            type: String,
            required: true,
        },
        currency:{
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePic: {
            type: String,
            default: "",
        },
        emailToken:{ 
            type:String,
        },
        isVerified:{ 
            type:Boolean,
        }

     },
        { timeStamps: true }
    
)


module.exports = mongoose.model("User", UserSchema)