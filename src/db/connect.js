const mongoose = require("mongoose")

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://bhavanaeligeti5:Bhavana123@cluster0.vx1hapl.mongodb.net/?retryWrites=true&w=majority",).then(() => {
    console.log(`connection successful`);
}).catch((e) => {
    console.log(`no connection`);
})

module.exports = mongoose