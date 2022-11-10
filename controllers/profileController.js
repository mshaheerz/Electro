const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const cartmodel = require('../model/cartSchema')
const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')
const wishlistmodel = require('../model/wishlistSchema')
const { db, collection } = require('../model/productSchema')
const { request, response } = require('express')
const mongoose = require('mongoose')
const ordermodel = require('../model/orderSchema')
const addressModel = require('../model/addressSchema')
const addressmodel = require('../model/addressSchema')


async function getDiscountprice(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    return discount = cart.products.reduce((acc, cur) => (acc +
        cur.item.discount * cur.quantity), 0)
}

async function getTotalprice(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
    return total = cart.products.reduce((acc, cur) => (acc +
        cur.item.price * cur.quantity), 0)
}




module.exports.profile = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
        const order = ordermodel.find().populate('user').populate('products.item')



        const total = await getTotalprice(token)
        const discount = await getDiscountprice(token)
        res.locals.wishlist = wishlist
        res.locals.order = order || null
        res.locals.user = user || null
        res.locals.total = total
        res.locals.cart = cart
        res.locals.discount = discount
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/profile', { token: "", alert: true, category, cart })
        } else {

            res.render('user/profile', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}

module.exports.profile_dashboard = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
        const order = ordermodel.find().populate('user').populate('products.item')


        if (cart != null) {
            const total = await getTotalprice(token)
            const discount = await getDiscountprice(token)
            res.locals.total = total
            res.locals.cart = cart
            res.locals.discount = discount
        }
        res.locals.wishlist = wishlist
        res.locals.order = order


        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/profiledashboard', { token: "", alert: true, category, cart })
        } else {

            res.render('user/profiledashboard', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}



module.exports.profile_orders = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
        const order = await ordermodel.find({ user: userId }).populate({
            path: 'products',
            populate: {
                path: 'item',
                model: 'products',
            }
        }).sort({ createdAt: -1 })





        res.locals.user = user || null
        res.locals.wishlist = wishlist
        res.locals.order = order || null

        res.locals.cart = cart

        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (order != '') {
            const total = await getTotalprice(token)
            const discount = await getDiscountprice(token)
            res.locals.total = total || null
            res.locals.discount = discount || null
        }

        if (user.isBanned) {
            res.render('user/profileorders', { token: "", alert: true, category, cart })
        } else {

            res.render('user/profileorders', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}

module.exports.profile_address = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
        const order = await ordermodel.find().populate('user').populate('products.item')
        const address = await addressmodel.find({ user: userId })

        res.locals.address = address
        console.log(address);
        console.log(cart)
        if (cart != null) {
            const total = await getTotalprice(token)
            const discount = await getDiscountprice(token)
            res.locals.order = order
            res.locals.total = total
            res.locals.cart = cart || null
            res.locals.discount = discount
        }

        res.locals.wishlist = wishlist


        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/profileaddress', { token: "", alert: true, category, cart })
        } else {

            res.render('user/profileaddress', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}

module.exports.profile_accountdetails = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        let cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.find().populate('user').populate('products.item')
        const order = ordermodel.find().populate('user').populate('products.item')
        const address = addressmodel.find({ user: userId })
        if (cart != null) {
            const total = await getTotalprice(token)
            const discount = await getDiscountprice(token)
            res.locals.cart = cart
            res.locals.discount = discount
            res.locals.total = total
        }

        res.locals.address = address
        res.locals.wishlist = wishlist
        res.locals.order = order


        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/profiledetails', { token: "", alert: true, category, cart })
        } else {

            res.render('user/profiledetails', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
}


module.exports.add_address = async (req, res) => {
    const token = req.cookies.jwt
    const { name, address, city, state, zip, phone, email } = req.body

    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        let obj = {
            user: userId, address: [{ name, address, city, state, zip, phone, email }]
        }
        let objpush = { name, address, city, state, zip, phone, email }
        const user = await Usermodel.findById(userId)
        let isaddress = await addressmodel.findOne({ user: userId })
        if (isaddress) {

            isaddress.address.push(objpush)
            isaddress.save().then((data) => {
                res.redirect('/profile_address')
            }).catch((error) => {
                res.send({ "status": "push failed", "message": error })

            })

        } else {
            await addressmodel.create(obj).then((data) => {
                res.redirect('/profile_address')
            }).catch((error) => {
                res.send({ "status": "creat failed", "message": error })

            })
        }
    }
}


module.exports.edit_address = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.query
    console.log(id)
    const { name, address, city, state, zip, phone, email } = req.body

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        //     let obj={
        // user:userId,address:[{name,address,city,state,zip,phone,email}]
        // }
        let objpush = { name, address, city, state, zip, phone, email }

       const addresses =  await addressmodel.findOne({user:userId })
       addresses.address[id] = objpush;
       console.log(addresses);
       await addresses.save();

       res.redirect('/profile_address')

    }

}

module.exports.delete_address = async (req, res) => {



    const token = req.cookies.jwt
    const { address } = req.body


    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID

        await addressmodel.updateOne({ user: userId }, { $pull: { address: { _id: address } } }).then((data) => {
            res.json({ response: true, address: address, data: data })
        }).catch((err) => {
            res.json({ response: true, address: address, error: error })

        })

    }


}



