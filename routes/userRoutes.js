const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const usergetController = require("../controllers/usergetController")
const authmiddleware = require('../middlewares/authmiddleware')
const cookieParser = require("cookie-parser")
const { logger } = require('../config/emailConfig')
// const userController = require("../controllers/userController")
const client =require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
router.use(cookieParser())
router.use(express.static("public"))
// router.use(function (req, res, next) {
//     res.locals.user = null
//     next()
//   })

//route level middleware
router.use('/changepassword',authmiddleware.checkUserAuth)
router.use('/loggeduser', authmiddleware.checkUserAuth)
router.get('/',authmiddleware.checkUserAuth)


router.post('/otp',(req,res)=>{

  client.verify.services(process.env.SERVICE_ID).verifications
  .create({
    to:`+${req.body.phone}`,
    channel: 'sms',
  }).then((data)=>{
    res.status(200).send(data)
  }).catch((err)=>{
    res.send(err)
  })

})

router.post('/verify',(req,res)=>{

  client.verify.services(process.env.SERVICE_ID).verificationChecks
  .create({
    to:`+${req.body.phone}`,
    code: req.body.code,
  }).then((data)=>{
    if(data.status.approved){
      console.log("success",data.status=="approved");
    }
    res.status(200).send(data)
  }).catch((err)=>{
    res.send(err)
  })
})
//public routes

  //get routes

router.get('/login',usergetController.login_get)
router.get('/signup',usergetController.signup_get)
router.get('/',usergetController.home_page)
router.get('/logout',usergetController.logout_get)







  //post routes
router.post('/signup',userController.userRegistration)
router.post('/login',userController.userLogin)
router.post('/send-reset-password-email',userController.sendUserPasswordResetEmail)
router.post('/reset/:id/:token',userController.userPasswordReset)







//protected routes
router.post('/changepassword',userController.changeUserPassword)
router.get('/loggeduser', userController.loggedUser)



module.exports= router