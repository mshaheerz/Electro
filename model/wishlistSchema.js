const mongoose = require('mongoose');


const wishlistSchema = new mongoose.Schema({
    user:{type:mongoose.Types.ObjectId,
    ref:'user',
    required:true
    },
    products:[{
        item:{type: mongoose.Types.ObjectId,
        ref:'products',
        required: true
     },
        }],

},
{
  timestamps:true,
}
);

const wishlistmodel = mongoose.model("wishlist",wishlistSchema)
module.exports = wishlistmodel