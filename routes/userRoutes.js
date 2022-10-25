const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const usergetController = require("../controllers/usergetController")
const checkUserAuth = require('../middlewares/authmiddleware')
const cookieParser = require("cookie-parser")
// const userController = require("../controllers/userController")

router.use(cookieParser())
router.use(express.static("public"))
// router.use(function (req, res, next) {
//     res.locals.user = null
//     next()
//   })

//route level middleware
router.use('/changepassword',checkUserAuth)
router.use('/loggeduser', checkUserAuth)


//public routes

  //get routes

router.get('/login',usergetController.login_get)
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