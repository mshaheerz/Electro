const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const jwt = require('jsonwebtoken')



module.exports.home_page = async (req, res) => {
    const token = req.cookies.jwt
    const category = await categorymodel.find()
    if (token) {


        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)


        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/index', { token: "", alert: true, category })
        } else {

            res.render('user/index', { token, fullname, useremail, alert: false, category })
        }
    } else {
        res.render('user/index', { token, alert: false, category })
    }
}

module.exports.signup_post = (req, res) => {
    res.send("login post")



}

module.exports.login_get = async (req, res) => {
    const category = await categorymodel.find()
    const token = req.cookies.jwt
    if (token) {
        res.redirect("/")
    } else {
        res.render("user/login", { token: false, emailerr: '', passerr: "", allerr: "", category })
    }

}

module.exports.signup_get = async (req, res) => {
    const token = req.cookies.jwt
    const category = await categorymodel.find()
    if (token) {
        res.redirect("/")
    } else {
        res.render("user/signup", { token: false, emailerr: '', passerr: "", allerr: "", category })
    }

}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}


module.exports.shop = async (req, res) => {
    const token = req.cookies.jwt
    const category = await categorymodel.find()
    const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
    //filtering
    let products = await productmodel.find().populate('category')
    if (req.query.category) {
        console.log(req.query.category);

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
        console.log(req.query.category);

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
}


module.exports.product = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.query
    const category = await categorymodel.find()
    const products = await productmodel.findById(id).populate('category')
    const brand = await productmodel.find().sort({ brand: 1 }).distinct('brand')
    if (token) {


        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)


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
}


