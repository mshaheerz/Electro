const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const checkUserAuth = require('../middlewares/authmiddleware')
// const userController = require("../controllers/userController")


//route level middleware
router.use('/changepassword',checkUserAuth)
router.use('/loggeduser', checkUserAuth)


//public routes
router.post('/signup',userController.userRegistration)
router.post('/login',userController.userLogin)
router.post('/send-reset-password-email',userController.sendUserPasswordResetEmail)
router.get('/reset/:id/:token',userController.userPasswordReset)







//protected routes
router.post('/changepassword',userController.changeUserPassword)
router.get('/loggeduser', userController.loggedUser)



module.exports= router