const dotenv = require('dotenv');
dotenv.config()
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    // process.env.EMAIL_HOST
    port:587,
    // port:process.env.EMAIL_PORT,
    secure:false,
    auth:{
        user:'ledxlight1@gmail.com',
        pass:'bvfogtdcbfvavbcl'
        // user: process.env.EMAIL_USER,  // ADMIN GMAIL ID
        // pass: process.env.EMAIL_PASS, //ADMIN GMAIL PASSWORD
    },
  
})
module.exports = transporter
