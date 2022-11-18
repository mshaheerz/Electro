const adminmodel = require('../model/adminschema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usermodel = require('../model/userschema');
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const ordermodel = require('../model/orderSchema')
const moment = require('moment');
const { reset } = require('nodemon');
const { request, response } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { log } = require('console');
const { encode } = require('punycode');
const { loadFont } = require('figlet');
const { send } = require('process');
const { format } = require('path');
const { validateExpressRequest } = require('twilio/lib/webhooks/webhooks');
const couponmodel = require('../model/couponSchema');
const { cursorTo } = require('readline');
const bannermodel = require('../model/bannerSchema');


//helper function
async function admincheck(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const adminID = decoded.adminID
    const admin = await adminmodel.findById(adminID)
    const adminemail = admin.email
    return adminemail
}


module.exports.admin_login = async (req, res) => {
    const token = req.cookies.jwts
    if (token) {
        res.redirect('/admin')
    } else {
        res.render('admin/login', { emailerr: "", passerr: "", allerr: "" })
    }

}


module.exports.admin_home = async (req, res) => {
    const user = await usermodel.find().count()
    const product = await productmodel.find().count()
    const category = await categorymodel.find().count()
    const order = await ordermodel.find().populate('user').sort({ updatedAt: -1 }).limit(8)
    res.locals.order=order ||null
    const token = req.cookies.jwts
    res.locals.moment=moment
    if (token) {
        adminemail = await admincheck(token)
        const orders=await ordermodel.find()
        const totalsale = orders.reduce((acc,cur)=>(acc+cur.totalamount),0)
        res.locals.totalsale  = totalsale || null
        res.render('admin/index', { adminemail: adminemail, user: user, product: product, category: category })
    } else {
        res.render('admin/login', { emailerr: "", passerr: "", allerr: "" });
    }
}


module.exports.admin_login_post = async (req, res) => {
    const { email, password } = req.body
    const admin = await adminmodel.findOne({ email: email })
    if (admin != null) {
        if (email && password) {
            const isMatch = await bcrypt.compare(password, admin.password)
            if (admin.email === email && isMatch) {
                const token = jwt.sign({ adminID: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                res.cookie('jwts', token, { httpOnly: true });
                res.redirect('/admin')
            } else {
                res.render('admin/login', { emailerr: "", passerr: "", allerr: "email or password missmatch" });
            }
        } else {
            res.render('admin/login', { emailerr: "", passerr: "", allerr: "all fields are required" });
        }
    } else {
        res.render('admin/login', { emailerr: "your not registered admin", passerr: "", allerr: "" });
    }
}


module.exports.logout_get = (req, res) => {
    res.cookie('jwts', '', { maxAge: 1 });
    res.redirect('/admin/login');
}


//user 
module.exports.user_list = async (req, res) => {
    user = await usermodel.find({})
    const token = req.cookies.jwts
    adminemail = await admincheck(token)
    res.render('admin/users', { user, adminemail: adminemail, moment: moment })
}

module.exports.flag_user = async (req, res) => {
    const { email } = req.query
    try {
        await usermodel.updateOne({ email: email }, { isBanned: true })
        res.redirect('/admin/users_list')
    } catch (error) {
        res.send({ "status": "failed", "message": error.message });
    }
}


module.exports.remove_user_flag = async (req, res) => {
    const { email } = req.query
    try {
        await usermodel.updateOne({ email: email }, { isBanned: false })
        res.redirect('/admin/users_list')
    } catch (error) {
        res.send({ "status": "failed", "message": error.message });
    }
}


module.exports.user_details = async (req, res) => {
    const token = req.cookies.jwts
    try {
        adminemail = await admincheck(token)
        const { email } = req.query
        user = await usermodel.findOne({ email })
        res.render('admin/userdetails', { adminemail: adminemail, user, moment })
    } catch (error) {
        res.send({ "status": "failed", "message": error.message })
    }
}


module.exports.delete_user = async (req, res) => {
    const { email } = req.query
    try {
        await usermodel.deleteOne({ email: email })
        res.redirect('/admin/users_list')
    } catch (error) {
        res.send({ "status": "failed", "message": error.message });
    }
}


module.exports.category_list = async (req, res) => {
    const token = req.cookies.jwts
    const category = await categorymodel.find({})
    adminemail = await admincheck(token)
    res.render('admin/categorylist', { category, adminemail: adminemail })
}


module.exports.category_details = async (req, res) => {
    const { id } = req.query
    const category = categorymodel.findOne({ _id: id })
    res.render('admin/categorylist', category)
}


module.exports.delete_category = async (req, res) => {
    try {
        const { id } = req.query
        await categorymodel.findByIdAndDelete({ _id: id })
        const folder = path.join(__dirname, '..', `public/admin/serverimages/category`, `${id}.png`)
        fs.rmSync(folder, {
            force: true,
        })
        res.redirect('/admin/category_list')
    } catch (error) {
        res.send({ "status": "failed", "message": error.message })
    }
}


module.exports.edit_category = async (req, res) => {
    const { id } = req.query
    const { category_name, category_description } = req.body
    await categorymodel.findByIdAndUpdate(id, {
        category_name: category_name,
        category_description: category_description
    })
    res.redirect('/admin/category_list')
}


module.exports.add_category = async (req, res, next) => {
    // const {category_name,category_description}= req.body 
    const category_thumbnail = req.file
    if (!category_thumbnail) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400;
        return next(error)
    }
    const { category_name, category_description } = req.body
    let img = fs.readFileSync(category_thumbnail.path)
    const encode_image = img.toString('base64')
    let newUpload = new categorymodel({
        category_name: category_name,
        category_description: category_description,
        category_thumbnail: category_thumbnail.originalname,
        contentType: category_thumbnail.mimetype,
        imageBase64: encode_image
    })
    return newUpload.save().then(() => {
        res.redirect('/admin/category_list')
    }).catch(error => {
        if (error) {
            if (error.name === 'mongoerror' && error.code === 11000) {
                return Promise.reject({ error: "duplicate file already exists" })
            }
            return Promise.reject({ error: "error" })
        }
    })
}


module.exports.add_products = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const category = await categorymodel.find()
    res.render('admin/products', { adminemail, category })
}


module.exports.add_products_post = async (req, res, next) => {
    try {
        const files = req.body.images
        const file = req.files
      
        
        const { name, description, brand, price, category, colors, stock, discount, tags } = req.body
        if (!files) {
            const error = new Error('Please choose files')
            error.httpStatusCode = 400;
            return next(error)
        }

//sharp image

        
        
        let imgArray = files.map((file) => {
    
            let img = fs.readFileSync('./public/productuploads/'+file)
    
            return encode_image = img.toString('base64')
        })
      
        let result = imgArray.map((src, index) => {
            let finalimg = {
                imageName: file[index].originalname,
                contentType: file[index].mimetype,
                imageBase64: src
            }
            return finalimg;
        })
        try {
            files.forEach((el, i) => {
            fs.rmSync('./public/productuploads/'+el, {
               
            })
        })
        } catch (error) {
            console.log(error);
        }
        
        await productmodel.create({ name, description, brand, price, category, colors, stock, discount, tags, product_image: result }).then((data) => {
            // res.send({"success":data})
            res.redirect('/admin/product_lists')
        }).catch((err) => {
            res.send({ "failed": err })
        })
    } catch (error) {
        console.log(error);
        res.send(error)
        // res.redirect('/admin/product_lists')
        
    }
   
}


module.exports.product_list = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const products = await productmodel.find().populate('category')
    res.render('admin/productlist', { adminemail, products })
}

module.exports.delete_product = async (req, res) => {
    const { id } = req.query
    await productmodel.findByIdAndDelete(id).then((data) => {
        // res.send({"status":"success","message":data})
        res.send("<script>alert('Product delete successfull'); window.location.href = '/admin/product_lists'; </script>");
    }).catch((err) => {
        res.send({ "status": "failed", "message": err })
    })
}

module.exports.edit_product = async (req, res) => {
    const { id } = req.query
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const category = await categorymodel.find()
    await productmodel.findById(id).populate('category').then((product) => {
        // res.send({"status":"success","message":data})
        res.render('admin/editproducts', { category, product, adminemail })
    }).catch((err) => {
        res.send({ "status": "failed", "message": err })
    })
}


module.exports.edit_products_post = async (req, res) => {
    const { id } = req.query
    const file = req.files
    const files = req.body.images
    const { name, description, brand, price, category, colors, stock, discount, tags } = req.body
    if (file == '') {
        await productmodel.findOneAndUpdate({ _id: id }, { name, description, brand, price, category, colors, stock, discount, tags }).then((data) => {
            // res.send({"success":data})
            res.redirect('/admin/product_lists')
        }).catch((err) => {
            res.send({ "first worked": err.message })
        })
    } else {
        let imgArray = files.map((file) => {
            let img = fs.readFileSync('./public/productuploads/'+file)
            return encode_image = img.toString('base64')
        })
        let result = imgArray.map((src, index) => {
            let finalimg = {
                imageName: file[index].originalname,
                contentType: file[index].mimetype,
                imageBase64: src
            }
            return finalimg;
        })
        try {
             files.forEach((el, i) => {
            fs.rmSync('./public/productuploads/'+el, {
                force: true
            })
        })
        } catch (error) {
            res.send(error)
        }
       
        await productmodel.findByIdAndUpdate(id, { name, description, brand, price, category, colors, stock, discount, tags, product_image: result }).then((data) => {
            // res.send({ "success": data, "files": files })
            res.redirect('/admin/product_lists')
        }).catch((err) => {
            res.send({ "second workde": err })
        })
    }
}

module.exports.order_list = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const order =await ordermodel.find().populate('user').populate('products').sort({createdAt:-1})
    // const products = await productmodel.find().populate('category')
    res.locals.order = order|| null 
    res.locals.moment = moment
    res.render('admin/orderlist', { adminemail })
}

module.exports.order_details = async (req,res)=>{
    try {
    const token = req.cookies.jwts
    const {id}=req.query
    const adminemail = await admincheck(token)
    const order =await ordermodel.findById(id).populate('user').populate({path:'products',populate: {path: 'item',model:'products'},
      })
    // const products = await productmodel.find().populate('category')
    res.locals.order = order|| null 
    res.locals.moment = moment
    res.render('admin/orderdetails', { adminemail })
    } catch (error) {
       res.redirect('/admin/order_list')
        
    }
  
}
module.exports.change_status= async (req, res) => {
    const {orderId,status}=req.body
    await ordermodel.findByIdAndUpdate(orderId,{
        status:status
    })
    res.json(true)
}

module.exports.coupon_list = async (req,res)=>{
    try {
    const token = req.cookies.jwts
    const {id}=req.query
    const adminemail = await admincheck(token)
    const  coupon = await couponmodel.find({})
    res.locals.coupon = coupon || null
    // const products = await productmodel.find().populate('category')
    res.locals.moment = moment
    res.render('admin/couponlist', { adminemail })
    } catch (error) {
       res.redirect('/admin/coupon_list')
        
    }
  
}

module.exports.add_coupon = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)

    res.render('admin/coupondetails', {adminemail})
}
module.exports.add_coupon_post = async(req,res)=>{
    const{...data}=req.body
    console.log(data)
   
    await couponmodel.create(data)
   
    res.redirect('/admin/coupon_list')
    
}

module.exports.coupon_edit_post = async(req,res)=>{
    const{...data}=req.body
    const {id}=req.query
    console.log(data)
   
    await couponmodel.findByIdAndUpdate(id,data)
   
    res.redirect('/admin/coupon_list')
    
}
module.exports.coupon_edit = async(req,res)=>{
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const{id}=req.query

    const coupon = await couponmodel.findById(id)
    res.locals.coupon=coupon
    res.locals.moment=moment
    res.render('admin/couponedit',{adminemail})
}


module.exports.banner_list = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const banner = await bannermodel.find()
    res.locals.banner = banner || null
    const products = await productmodel.find().populate('category')
    res.render('admin/bannerlist', { adminemail, products })
}


module.exports.add_banner = async (req, res) => {
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const banner = await bannermodel.find()
    res.locals.banner = banner || null

    res.render('admin/addbanner', { adminemail })
}

module.exports.add_banner_post = async (req, res, next) => {
    // const {category_name,category_description}= req.body 
    const images = req.file
    if (!images) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400;
        return next(error)
    }
    const {name,description,productname,url,price,discount } = req.body
    let img = fs.readFileSync(images.path)
    const encode_image = img.toString('base64')
    let newUpload = new bannermodel({
        name: name,
        description,
        productname,
        url,
        price,
        discount,
        category_thumbnail: images.originalname,
        contentType: images.mimetype,
        imageBase64: encode_image
    })
    return newUpload.save().then(() => {
        res.redirect('/admin/banner_list')
    }).catch(error => {
        if (error) {
            if (error.name === 'mongoerror' && error.code === 11000) {
                return Promise.reject({ error: "duplicate file already exists" })
            }
            return Promise.reject({ error: "error" })
        }
    })
}


module.exports.edit_banner = async (req, res) => {
    const {id}= req.query
    const token = req.cookies.jwts
    const adminemail = await admincheck(token)
    const banner = await bannermodel.findById(id)
    res.locals.banner = banner || null

    res.render('admin/editbanner', { adminemail })
}

module.exports.edit_banner_post = async (req, res, next) => {
    // const {category_name,category_description}= req.body 
    const {name,description,productname,url,price,discount } = req.body
    const {id}=req.query

    const images = req.file
    if (!images) {

        let newUpload = {
            name,
            description,
            productname,
            url,
            price,
            discount
        }
        console.log(req.body,req.query);
        await bannermodel.findByIdAndUpdate(id, newUpload)
        res.redirect('/admin/banner_list')


   
    }else{
  
    let img = fs.readFileSync(images.path)
    const encode_image = img.toString('base64')
      
    let newUpload = {
        name,
        description,
        productname,
        url,
        price,
        discount,
        category_thumbnail: images.originalname,
        contentType: images.mimetype,
        imageBase64: encode_image
    }
    await bannermodel.findByIdAndUpdate(id, newUpload)
    res.redirect('/admin/banner_list')

    }
   
}


module.exports.checkCoupon = async (req, res) => {
  const {couponcheckid}=req.body
  coupon = await couponmodel.find({code:couponcheckid.trim()})
  if(coupon){
    res.json({status:true,coupon})
  }else{
    res.json({status:false,err:'Sorry no coupon available'})
  }
  console.log(couponcheckid)


   
}