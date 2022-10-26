const mongoose = require('mongoose');
var express = require('express');


const connectDb = async (DATABASE_URL) => {
    try{
        const DB_OPTIONS ={dbName:'electro'}
        await mongoose.connect(DATABASE_URL,DB_OPTIONS )
        console.log('connected successfully..');
    }catch(error){
        console.log(error);
    }
}
module.exports = connectDb; 



// const mongoDB = "mongodb://localhost:27017/electro";
//  mongoose.connect(mongoDB, {
//      useNewUrlParser: true,
//      useUnifiedTopology: true 
//     }).then(()=>
//     {console.log("connection successfull");
// }).catch(err=>{
//     console.log("connection error: ",err)
// });


// Define a schema

