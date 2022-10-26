const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")
const cookieParser = require("cookie-parser")
const { reset } = require('nodemon')
// const userController = require("../controllers/userController")
router.use(cookieParser())


router.use(express.static("public"))


router.use(function (req, res, next) {
    res.locals.user = null
    next()
  })

//get routes
  router.get('/',adminController.admin_home)
  router.get('/login',adminController.admin_login)
  router.get('/logout',adminController.logout_get)

//post routes
router.post('/login',adminController.admin_login_post)

  module.exports= router

