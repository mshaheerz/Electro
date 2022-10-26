const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")
const cookieParser = require("cookie-parser")
const { reset } = require('nodemon')
const authmiddleware = require('../middlewares/authmiddleware')
// const userController = require("../controllers/userController")
router.use(cookieParser())


router.use(express.static("public"))


router.use(function (req, res, next) {
    res.locals.user = null
    next()
  })
  


  //route level middle wares

  router.use('/users_list', authmiddleware.checkAdminAuth)

//get routes
  router.get('/',adminController.admin_home)
  router.get('/login',adminController.admin_login)
  router.get('/logout',adminController.logout_get)



  
//post routes
router.post('/login',adminController.admin_login_post)





//protected routes
  router.get('/users_list',adminController.user_list)


  module.exports= router

