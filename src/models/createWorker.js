const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const createSchema = new Schema({
    name : {
        type:String,
        required:true,
    },
    username : {
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    phonenumber : {
        type:String,
        required:true
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
const Workers = mongoose.model("createModel", createSchema);
module.exports = Workers
