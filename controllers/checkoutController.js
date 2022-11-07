const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const cartmodel = require('../model/cartSchema')
const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')
const wishlistmodel = require('../model/wishlistSchema')
const { db, collection } = require('../model/productSchema')
const { request } = require('express')
const mongoose = require('mongoose')
const ordermodel = require('../model/orderSchema')


async function  getDiscountprice(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    return discount= cart.products.reduce((acc,cur)=>(acc+
        cur.item.discount*cur.quantity), 0)
}

async function  getTotalprice(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    return total= cart.products.reduce((acc,cur)=>(acc+
        cur.item.price*cur.quantity), 0)
}




module.exports.checkout = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
       
    
            
                const total = await getTotalprice(token)
                const discount =await getDiscountprice(token)
         res.locals.wishlist=wishlist
        res.locals.total=total
        res.locals.cart = cart
        res.locals.discount=discount
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/checkout', { token: "", alert: true, category, cart })
        } else {

            res.render('user/checkout', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}
module.exports.place_order = async (req, res) => {
    const token = req.cookies.jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    const {name,address,city,state,zip,phone,payment}=req.body
    let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    let status = payment==='cod'?'placed':'pending'
    const total = await getTotalprice(token)
    const discount =await getDiscountprice(token)
    const orderObj={
        address:{
            name,
            address,
            city,
            state,
            zip,
            phone,
        },
        userId,
        payment,
        products:cart.products,
        totalamount:total-discount,
        status:status,

    }
    await ordermodel.create(orderObj).then(async (data) =>{
        console.log(data);
        await cartmodel.deleteOne({user:userId})
        res.json(data)
    }).catch((error)=>{
        console.log(error);
        res.json(error)
    })
    
}



module.exports.ordersuccess = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
       
    
            
                const total = await getTotalprice(token)
                const discount =await getDiscountprice(token)
         res.locals.wishlist=wishlist
        res.locals.total=total
        res.locals.cart = cart
        res.locals.discount=discount
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/ordersuccess', { token: "", alert: true, category, cart })
        } else {

            res.render('user/ordersuccess', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}