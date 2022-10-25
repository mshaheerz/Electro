const mongoose = require('mongoose');


const adminschema = new mongoose.Schema({
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim:true,
  },
  password: {
    type: String,
    trim:true,
    required: true,
    minlength: [6],
  }
});

const adminmodel = mongoose.model("admin",adminschema )
module.exports = adminmodel