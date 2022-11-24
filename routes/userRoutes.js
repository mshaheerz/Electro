const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const usergetController = require("../controllers/usergetController")
const shopController = require("../controllers/shopController")
const checkoutController = require("../controllers/checkoutController")
const profileController = require("../controllers/profileController")
const authmiddleware = require('../middlewares/authmiddleware')
const multipleuploadmiddleware = require('../middlewares/uploadresizemiddleware')
const cookieParser = require("cookie-parser")
const { logger } = require('../config/emailConfig')
const { Router } = require('express')
// const userController = require("../controllers/userController")
const client =require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
router.use(cookieParser())
router.use(express.static("public"))
// router.use(function (req, res, next) {
//     res.locals.user = null
//     next()
//   })

//route level middleware
router.get('/uploadmultiple',(req,res)=>{
  res.render('user/newfile')
})
router.post('/multiple-upload',multipleuploadmiddleware.uploadImages,multipleuploadmiddleware.resizeImages,multipleuploadmiddleware.getResult)



router.use('/changepassword',authmiddleware.checkUserAuth)
router.use('/loggeduser', authmiddleware.checkUserAuth)
router.get('/',authmiddleware.checkUserAuth)
router.get('/shop',authmiddleware.checkUserAuth)
router.get('/cart',authmiddleware.checkUserAuth)
router.post('/addcart',authmiddleware.checkUserAuth)
router.post('/change-product-quantity',authmiddleware.checkUserAuth)
router.post('/delete_cart',authmiddleware.checkUserAuth)
router.post('/addcartproduct',authmiddleware.checkUserAuth)





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
router.get('/otp',usergetController.otp)
router.post('/orpverify',userController.userotp)
router.get('/login',usergetController.login_get)
router.get('/signup',usergetController.signup_get)
router.get('/logout',usergetController.logout_get)
router.get('/',usergetController.home_page)
router.get('/shop',usergetController.shop)
router.get('/shopfilter',usergetController.filtershop)
router.get('/product',usergetController.product)
router.get('/cart',shopController.cart)
router.post('/addcart',shopController.addToCart)
router.get('/wishlist',shopController.wishlist)
router.get('/checkout',checkoutController.checkout)
router.get('/coupons',shopController.coupons)
router.get('/ordersuccess',checkoutController.ordersuccess)





router.get('/profile',profileController.profile)
router.get('/profile_dashboard',profileController.profile_dashboard)
router.get('/profile_order',profileController.profile_orders)
router.get('/profile_address',profileController.profile_address)
router.get('/profile_details',profileController.profile_accountdetails)





router.post('/review',shopController.review)
router.post('/order_cancel',checkoutController.order_cancel)
router.post('/place_failed_order',checkoutController.place_failed_order)
router.post('/verify-payment',checkoutController.verify_payment)
router.post('/add_address',profileController.add_address)
router.post('/place-order',checkoutController.place_order)
router.post('/add_wishlist',shopController.addToWishlist)
router.post('/change-product-quantity',shopController.change_quantity)
router.post('/delete_cart',shopController.delete_cart)
router.post('/delete_wishlist',shopController.delete_wishlist)
router.post('/addcartproduct',shopController.addcartproduct)
router.post('/delete_address',profileController.delete_address)
router.post('/edit_address',profileController.edit_address)
router.post('/user_edit',profileController.user_edit)


  //post routes
router.post('/signup',userController.userRegistration)
router.post('/login',userController.userLogin)
router.post('/send-reset-password-email',userController.sendUserPasswordResetEmail)
router.post('/reset/:id/:token',userController.userPasswordReset)



//protected routes
router.post('/changepassword',userController.changeUserPassword)
router.get('/loggeduser', userController.loggedUser)



module.exports= router