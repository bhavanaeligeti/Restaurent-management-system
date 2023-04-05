const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const qtySchema = new Schema({
    pname : {
        type : Array , 
        default : []
    },
    username : {
        type:String,
        required : true,
        unique:true
    },
    pprice : {
        type : Array , 
        default : []
    },
    qty : {
        type : Array , 
        default : []
    },

});

// Compile model from schema
const qtyModel = mongoose.model("qtysModel", qtySchema);
module.exports = qtyModel
