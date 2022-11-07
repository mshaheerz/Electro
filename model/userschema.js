const mongoose = require('mongoose');
const product = require('./productSchema');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname:{type: String, required: true, trim:true},
    lastname:{type: String,required: true, trim:true},
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim:true,
  },
  phone:{
    type: String,
  },
  password: {
    type: String,
    trim:true,
    required: true,
    minlength: [6],
  },
  isBanned:{type:Boolean, default:false},
  address:[
    {
      name:{
        type: String
      },
      address:{
        type: String
      },
      city:{
        type: String
      },
      state:{
        type: String
      },
      zip:{
        type:Number
      },
      phone:{
        type: String
      },
      email:{
        type: String
      }
    }
  ]
 
},
{
  timestamps:true,
}
);


const usermodel = mongoose.model("user",userSchema )
module.exports = usermodel