const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username : {
        type:String,
        required:true,
        unique:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
     pnumber : {
        type:String,
        required:true,
    },
    password : {
        type:String,
        required:true
    },
    confirmpassword : {
        type:String,
        required:true
    },

});

// Compile model from schema
const User = mongoose.model("userModel", userSchema);
module.exports = User
