const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")
const cookieParser = require("cookie-parser")
const { reset } = require('nodemon')
const authmiddleware = require('../middlewares/authmiddleware')
const { Router } = require('express')
const uploadfile = require('../middlewares/fileuploadmiddleware');
const store = require('../middlewares/arrayfileupload');
const multipleuploadmiddleware = require('../middlewares/uploadresizemiddleware')

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
  router.get('/order_list',authmiddleware.checkAdminAuth)
  router.get('/order_details',authmiddleware.checkAdminAuth)
  router.get('/category_list',authmiddleware.checkAdminAuth)
  router.get('/products',authmiddleware.checkAdminAuth)
  router.get('/product_lists',authmiddleware.checkAdminAuth)
  router.get('/edit_product',authmiddleware.checkAdminAuth)
  router.get('/banner_list',authmiddleware.checkAdminAuth)


  
//get routes
  router.get('/',adminController.admin_home)
  router.get('/login',adminController.admin_login)
  router.get('/logout',adminController.logout_get)




//post routes
router.post('/login',adminController.admin_login_post)




const upload = adminController.upload
//protected routes
  router.post('/sales_report',adminController.sales_report)
  router.get('/add_coupon',adminController.add_coupon)
  router.get('/coupon_list',adminController.coupon_list)
  router.get('/order_list',adminController.order_list)
  router.get('/order_details',adminController.order_details)
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
  router.get('/edit_coupon',adminController.coupon_edit)
  router.get('/banner_list',adminController.banner_list)
  router.get('/add_banner',adminController.add_banner)
  router.get('/edit_banner',adminController.edit_banner)
  router.post('/edit_banner_post',uploadfile.upload.single('images'),adminController.edit_banner_post)



  //protected post routes
  router.post('/checkCoupon',adminController.checkCoupon)
  router.post('/add_banner',uploadfile.upload.single('images'),adminController.add_banner_post)
  router.post('/edit_coupon',adminController.coupon_edit_post)
  router.get('/update_coupon_status',adminController.update_coupon_status)
  router.post('/add_coupon',adminController.add_coupon_post)
  router.post('/edit_category',adminController.edit_category)
  router.post('/change_status',adminController.change_status)
  router.post('/add_products',multipleuploadmiddleware.uploadImages,multipleuploadmiddleware.resizeImages,adminController.add_products_post)
  router.post('/edit_product',multipleuploadmiddleware.uploadImages,multipleuploadmiddleware.resizeImages,adminController.edit_products_post)
      //file upload middleware
  router.post('/add_category',uploadfile.upload.single('category_thumbnail'),adminController.add_category)
  

  module.exports= router

