const mongoose = require('mongoose');

async function dbConnect(){
    await mongoose.connect(process.env.DB_URI);
}

module.exports=dbConnect;