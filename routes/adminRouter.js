const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")
const cookieParser = require("cookie-parser")
const { reset } = require('nodemon')
const authmiddleware = require('../middlewares/authmiddleware')
const { Router } = require('express')
const uploadfile = require('../middlewares/fileuploadmiddleware');
const store = require('../middlewares/arrayfileupload');
// const userController = require("../controllers/userController")
router.use(cookieParser())




router.use(express.static("public"))


router.use(function (req, res, next) {
    res.locals.user = null
    next()
  })
  


  //route level middle wares
  router.use('/users_list', authmiddleware.checkAdminAuth)
  router.get('/user_details',authmiddleware.checkAdminAuth)
  router.get('/category_list',authmiddleware.checkAdminAuth)
  router.get('/products',authmiddleware.checkAdminAuth)
  router.get('/product_lists',authmiddleware.checkAdminAuth)
  router.get('/edit_product',authmiddleware.checkAdminAuth)


  
//get routes
  router.get('/',adminController.admin_home)
  router.get('/login',adminController.admin_login)
  router.get('/logout',adminController.logout_get)




//post routes
router.post('/login',adminController.admin_login_post)




const upload = adminController.upload
//protected routes
  router.get('/users_list',adminController.user_list)
  router.get('/user_details',adminController.user_details)
  router.get('/flag_user',adminController.flag_user)
  router.get('/remove_user_flag',adminController.remove_user_flag)
  router.get('/delete_user',adminController.delete_user)
  router.get('/category_list',adminController.category_list)
  router.get('/delete_category',adminController.delete_category)
  router.get('/products',adminController.add_products)
  router.get('/product_lists',adminController.product_list)
  router.get('/delete_product',adminController.delete_product)
  router.get('/edit_product',adminController.edit_product)


  //protected post routes
  router.post('/edit_category',adminController.edit_category)
  router.post('/add_products',store.array('images',4),adminController.add_products_post)
  router.post('/edit_product',store.array('images',4),adminController.edit_products_post)
      //file upload middleware
  router.post('/add_category',uploadfile.upload.single('category_thumbnail'),adminController.add_category)
  

  module.exports= router

