const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const categorySchema = new mongoose.Schema({
    category_name:{type: String, required: true, trim:true},
    category_description:{type: String},
    product_count: {
    type: Number,
  },
  category_thumbnail:{type: String},
 
},
{
  timestamps:true,
}
);

const categorymodel = mongoose.model("category",categorySchema )
module.exports = categorymodel