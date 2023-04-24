const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const slotSchema = new Schema({
    name : {
        type:String,
        required:true,

    },
    usename : {
       type:String,
       required:true
    },
    email : {
        type:String,
        required:true,
        
    },
    pnumber : {
        type:String,
        required:true
    },
    slotf : {
        type:String,
        required:true
    },
    // slott : {
    //     type:String,
    //     required:true
    // },
    date : {
        type:String,
        required:true
    },
    person : {
        type:String,
        required:true
    },
    t_id : {
        type:Number,
        required:true
    },

});

// Compile model from schema
const slotModel = mongoose.model("slotModel", slotSchema);
module.exports = slotModel
