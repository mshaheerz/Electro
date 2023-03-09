const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const jwt = require('jsonwebtoken')
const cartmodel = require('../model/cartSchema')
const wishlistmodel=require('../model/wishlistSchema')
const reviewmodel = require('../model/reviewSchema')
const ordermodel = require('../model/orderSchema')
const bannermodel = require('../model/bannerSchema')
const { response } = require('express')
const moment = require('moment')



module.exports.home_page = async (req, res,next) => {
    try {
    const token = req.cookies.jwt
    const banner = await bannermodel.find()
    const category = await categorymodel.find()
    
    res.locals.banner=banner ||null

    if (token) {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const cart = await cartmodel.findOne({user:userId}).populate('user').populate('products.item')
       
        res.locals.cart=cart ||null
        const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
        res.locals.wishlist=wishlist
        const user = await Usermodel.findById(userId)

        res.locals.cart=cart
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/index', { token: "", alert: true, category })
        } else {

            res.render('user/index', { token, fullname, useremail, alert: false, category })
        }
    } else {
        
  
        
    
        res.locals.cart=null
        res.render('user/index', { token, alert: false, category })
    }
    } catch (error) {
        next(error)
    }
    
}

// module.exports.signup_post = (req, res) => {
//     res.send("login post")

// }

module.exports.login_get = async (req, res, next) => {
    try {
    const category = await categorymodel.find()
    const token = req.cookies.jwt
    if (token) {
        res.redirect("/")
    } else {
        res.render("user/login", { token: false, emailerr: '', passerr: "", allerr: "", category })
    }  
    } catch (error) {
        next(error)
    }
   

}

module.exports.signup_get = async (req, res, next) => {
    try {
    const token = req.cookies.jwt
    const category = await categorymodel.find()
    if (token) {
        res.redirect("/")
    } else {
        res.render("user/signup", { token: false, emailerr: '', passerr: "", allerr: "", category })
    }  
    } catch (error) {
        next(error)
    }
   

}

module.exports.logout_get = (req, res,next) => {
    try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');  
    } catch (error) {
        next(error)
    }
   
}


module.exports.shop = async (req, res,next) => {
    try {
       const token = req.cookies.jwt
    if(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID 
    const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
    res.locals.cart=cart || null
    res.locals.wishlist=wishlist ||null
    }
    const category = await categorymodel.find()
    const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
    //filtering
    let products = await productmodel.find().populate('category')
  


    if (req.query.category) {
        if (Array.isArray(req.query.category)) {    
                products = products.filter(obj => {
                    if (req.query.category.includes(obj.category.category_name)) return obj  
                })

        } else {

            products = products.filter(obj => {
               if (obj.category.category_name === req.query.category) return obj
            })
        }
    }

    if (req.query.brand) {

        if (Array.isArray(req.query.brand)) {
            
       
                products = products.filter(obj => {
                    if (req.query.brand.includes(obj.brand)) return obj  
                })

        } else {

            products = products.filter(obj => {
               if (obj.brand === req.query.brand) return obj
            })
        }
    }
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
       
        // res.locals.userDetails = user
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
          
            res.render('user/shop', { token: "", alert: true, category, products, brand })
        } else {

            res.render('user/shop', { token, fullname, useremail, alert: false, category, products, brand })
        }
    } else {
        res.render('user/shop', { token, alert: false, category, products, brand })
    }  
    } catch (error) {
        next(error)
    }
   
}







module.exports.filtershop = async (req, res, next) => {

try {
     const token = req.cookies.jwt

    const category = await categorymodel.find()
    const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
    //filtering
    let products = await productmodel.find().populate('category')

    if (req.query.category) {
        res.locals.categorytext=req.query.category || null
        products = products.filter(obj => {
               if (obj.category.category_name === req.query.category) return obj
            })    
    }

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
        res.locals.cart=cart
        res.locals.wishlist=wishlist
    
       
        // res.locals.userDetails = user
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        
        if (user.isBanned) {
          
            res.render('user/filtershop', { token: "", alert: true, category, products, brand })
        } else {

            res.render('user/filtershop', { token, fullname, useremail, alert: false, category, products, brand })
        }
    } else {
        res.render('user/filtershop', { token, alert: false, category, products, brand })
    }
} catch (error) {
    next(error)
}
   
}



module.exports.product = async (req, res, next) => {
    try {

        const token = req.cookies.jwt
        const { id } = req.query
        
        const category = await categorymodel.find()
        const products = await productmodel.findById(id).populate('category')
        const review = await reviewmodel.find({product:id}).populate('user').populate('product')
        const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
        res.locals.moment= moment
        res.locals.review =review||null
        if (token) {
    
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decoded.userID
            const user = await Usermodel.findById(userId)
            const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
            const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
            res.locals.wishlist=wishlist
            res.locals.cart=cart
            
    
    
            const fullname = user.firstname + " " + user.lastname
            let useremail = user.email
            if (user.isBanned) {
                res.render('user/product', { token: "", alert: true, category, products, brand })
            } else {
    
                res.render('user/product', { token, fullname, useremail, alert: false, category, products, brand })
            }
        } else {
            res.render('user/product', { token, alert: false, category, products, brand })
    
        }
    } catch (error) {
        next(error)
    }
   
}

module.exports.otp = async (req, res,next) => {
    try {
    const category = await categorymodel.find()
    const token = req.cookies.jwt
    if (token) {
        res.redirect("/")
    } else {
        res.render("user/otp", { token: false, emailerr: '', passerr: "", allerr: "", category })
    } 
    } catch (error) {
        next(error)
    }
   

}


module.exports.search = async (req, res, next) => {

    try {
         const token = req.cookies.jwt
        const {q}=req.query
        const category = await categorymodel.find()
        const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
        //filtering
        let products = await productmodel.find({name : {$regex :q}}).populate('category')
        res.locals.searchtext = q
    
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decoded.userID
            const user = await Usermodel.findById(userId)
            const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
            const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
            res.locals.cart=cart
            res.locals.wishlist=wishlist
        
           
            // res.locals.userDetails = user
            const fullname = user.firstname + " " + user.lastname
            let useremail = user.email
            
            if (user.isBanned) {
              
                res.render('user/search', { token: "", alert: true, category, products, brand })
            } else {
    
                res.render('user/search', { token, fullname, useremail, alert: false, category, products, brand })
            }
        } else {
            res.render('user/search', { token, alert: false, category, products, brand })
        }
    } catch (error) {
        next(error)
    }
       
    }

    module.exports.livesearch = async (req, res, next) => {

        try {
             const token = req.cookies.jwt
            const {q}=req.body
        
            //filtering
            let products = await productmodel.find({name : {$regex :q}}).populate('category')
            res.json({status:true,products})
            
           
        } catch (error) {
            next(error)
        }
           
        }