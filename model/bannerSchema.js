const mongoose = require('mongoose');


const bannerSchema = new mongoose.Schema({
    name:{type: String, required: true},
    description:{type: String},
    productname: {
    type: String,
  },
  url:{type: String},
  price:{type:Number},
  discount:{type:Number},
  category_thumbnail:{type: String},
  contentType:{type: String},
  imageBase64:{type:String}
 
},
{
  timestamps:true,
}
);

const bannermodel = mongoose.model("banner",bannerSchema )
module.exports = bannermodel