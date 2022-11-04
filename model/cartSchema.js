const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    user:{type:mongoose.Types.ObjectId,
    ref:'user',
    required:true
    },
    products:[{
        item:{type: mongoose.Types.ObjectId, ref:'products',
        required: true, },
        quantity:{type:Number,default:1}
        }],
   qty:{
    type: Number,
   },
   subtotal:{
    type: String,
   }

},
{
  timestamps:true,
}
);

const cartmodel = mongoose.model("cart",cartSchema )
module.exports = cartmodel