const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const otpSchema = new Schema({
   email : {
        type:String,
        required:true,   
    },
    code: {
        type:String,
        required:true,   
    },
    expiryt : {
        type:String,
        required:true,
    },
    

});

// Compile model from schema
const otpModel = mongoose.model("otpModel", otpSchema);
module.exports = otpModel