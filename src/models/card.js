const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const cardSchema = new Schema({
    address : {
        type:String,
        required:true,
    },
    username : {
        type:String,
        required:true,
    },
    cardname : {
        type:String,
        required:true,
       },

});

// Compile model from schema
const cardModel = mongoose.model("cardsModel", cardSchema);
module.exports = cardModel
