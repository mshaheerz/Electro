const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const productSchema = new mongoose.Schema({
    name:{type: String, required: true},
    description:{type: String, required: true},
    price: {
    type: Number,
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required:true,
  },
  colors:{type:[String]}
,
stock:{
    type:Number, required: true
},
brand:{
  type:String, required: true
},

discount:{
    type:Number,
    default:0
}
,
tags:{
    type:[String],
    required:true,
},
product_image:[
  
  {
  imageName:{
    type: String
},
  contentType:{
    type: String
},
  imageBase64:{
    type:String
}
  }
],

},
{
  timestamps:true,
}
);

const productmodel = mongoose.model("products",productSchema )
module.exports = productmodel