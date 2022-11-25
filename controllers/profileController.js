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
const bcrypt = require('bcrypt')
const moment = require('moment')

async function getDiscountprice(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  const userId = decoded.userID
  let cart = await cartmodel
    .findOne({ user: userId })
    .populate('user')
    .populate('products.item')
  return (discount = cart.products.reduce(
    (acc, cur) => acc + cur.item.discount * cur.quantity,
    0,
  ))
}

async function getTotalprice(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  const userId = decoded.userID
  let cart = await cartmodel
    .findOne({ user: userId })
    .populate('user')
    .populate('products.item')
  return (total = cart.products.reduce(
    (acc, cur) => acc + cur.item.price * cur.quantity,
    0,
  ))
}

module.exports.profile = async (req, res,next) => {
  try {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      const userId = decoded.userID
      const user = await Usermodel.findById(userId)
      let cart = await cartmodel
        .findOne({ user: userId })
        .populate('user')
        .populate('products.item')
      const wishlist = await wishlistmodel
        .findOne({ user: userId })
        .populate('user')
        .populate('products.item')
      const order = ordermodel.find().populate('user').populate('products.item')
  
      const total = await getTotalprice(token)
      const discount = await getDiscountprice(token)
      res.locals.wishlist = wishlist
      res.locals.order = order || null
      res.locals.user = user || null
      res.locals.total = total
      res.locals.cart = cart
      res.locals.discount = discount
      const fullname = user.firstname + ' ' + user.lastname
      let useremail = user.email
      if (user.isBanned) {
        res.render('user/profile', { token: '', alert: true, category, cart })
      } else {
        res.render('user/profile', {
          token,
          fullname,
          useremail,
          alert: false,
          category,
          cart,
        })
      }
    } else {
      res.send(
        '<script>alert("Login first "); window.location.href = "/login"; </script>',
      )
    }
  } catch (error) {
    next(error)
  }
 
}

module.exports.profile_dashboard = async (req, res, next) => {
  try {
   const token = req.cookies.jwt
  const { id } = req.body
  const category = await categorymodel.find()
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    const user = await Usermodel.findById(userId)
    let cart = await cartmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const wishlist = await wishlistmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
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

    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    if (user.isBanned) {
      res.render('user/profiledashboard', {
        token: '',
        alert: true,
        category,
        cart,
      })
    } else {
      res.render('user/profiledashboard', {
        token,
        fullname,
        useremail,
        alert: false,
        category,
        cart,
      })
    }
  } else {
    res.send(
      '<script>alert("Login first "); window.location.href = "/login"; </script>',
    )
  }
  } catch (error) {
    next(error)
  }
 
}

module.exports.profile_orders = async (req, res,next) => {
  try {
  const token = req.cookies.jwt
  const { id } = req.body
  const category = await categorymodel.find()
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    const user = await Usermodel.findById(userId)
    let cart = await cartmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const wishlist = await wishlistmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const order = await ordermodel
      .find({ user: userId })
      .populate({
        path: 'products',
        populate: {
          path: 'item',
          model: 'products',
        },
      })
      .sort({ updatedAt: -1 })

    res.locals.moment = moment || null
    res.locals.user = user || null
    res.locals.wishlist = wishlist
    res.locals.order = order || null

    res.locals.cart = cart

    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    if (order != '') {
      if(cart){
      const total = await getTotalprice(token)
      const discount = await getDiscountprice(token)
      res.locals.total = total || null
      res.locals.discount = discount || null
    }
    }

    if (user.isBanned) {
      res.render('user/profileorders', {
        token: '',
        alert: true,
        category,
        cart,
      })
    } else {
      res.render('user/profileorders', {
        token,
        fullname,
        useremail,
        alert: false,
        category,
        cart,
      })
    }
  } else {
    res.send(
      '<script>alert("Login first "); window.location.href = "/login"; </script>',
    )
  }
  } catch (error) {
    next(error)
  }
 
}

module.exports.profile_address = async (req, res,next) => {
  try {
    const token = req.cookies.jwt
  const { id } = req.body
  const category = await categorymodel.find()
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    const user = await Usermodel.findById(userId)
    let cart = await cartmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const wishlist = await wishlistmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const order = await ordermodel
      .find()
      .populate('user')
      .populate('products.item')
    const address = await addressmodel.find({ user: userId })

    res.locals.address = address
    console.log(address)
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

    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    if (user.isBanned) {
      res.render('user/profileaddress', {
        token: '',
        alert: true,
        category,
        cart,
      })
    } else {
      res.render('user/profileaddress', {
        token,
        fullname,
        useremail,
        alert: false,
        category,
        cart,
      })
    }
  } else {
    res.send(
      '<script>alert("Login first "); window.location.href = "/login"; </script>',
    )
  }
  } catch (error) {
    next(error)
  }
 
}

module.exports.profile_accountdetails = async (req, res,next) => {
try {
   const token = req.cookies.jwt
  const { id } = req.body
  const category = await categorymodel.find()
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    const user = await Usermodel.findById(userId)
    let cart = await cartmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
    const wishlist = await wishlistmodel
      .findOne({ user: userId })
      .populate('user')
      .populate('products.item')
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

    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    res.locals.emailerr = 'emailerr'
    res.locals.passerr = 'passerr'
    res.locals.allerr = 'allerr'
    res.locals.user = user || null
    if (user.isBanned) {
      res.render('user/profiledetails', {
        token: '',
        alert: true,
        category,
        cart,
      })
    } else {
      res.render('user/profiledetails', {
        token,
        fullname,
        useremail,
        alert: false,
        category,
        cart,
      })
    }
  } else {
    res.send(
      '<script>alert("Login first "); window.location.href = "/login"; </script>',
    )
  }
} catch (error) {
  next(error)
}
 
}

module.exports.add_address = async (req, res, next) => {
  try {
     const token = req.cookies.jwt
  const { name, address, city, state, zip, phone, email } = req.body
  const category = await categorymodel.find()
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    let obj = {
      user: userId,
      address: [{ name, address, city, state, zip, phone, email }],
    }
    let objpush = { name, address, city, state, zip, phone, email }
    const user = await Usermodel.findById(userId)
    let isaddress = await addressmodel.findOne({ user: userId })
    if (isaddress) {
      isaddress.address.push(objpush)
      isaddress
        .save()
        .then((data) => {
          res.redirect('/profile_address')
        })
        .catch((error) => {
          res.send({ status: 'push failed', message: error })
        })
    } else {
      await addressmodel
        .create(obj)
        .then((data) => {
          res.redirect('/profile_address')
        })
        .catch((error) => {
          res.send({ status: 'creat failed', message: error })
        })
    }
  }
  } catch (error) {
    next(error)
  }
 
}

module.exports.edit_address = async (req, res, next) => {
  try {
     const token = req.cookies.jwt
  const { id } = req.query
  console.log(id)
  const { name, address, city, state, zip, phone, email } = req.body

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    //     let obj={
    // user:userId,address:[{name,address,city,state,zip,phone,email}]
    // }
    let objpush = { name, address, city, state, zip, phone, email }

    const addresses = await addressmodel.findOne({ user: userId })
    addresses.address[id] = objpush
    console.log(addresses)
    await addresses.save()

    res.redirect('/profile_address')
  }
  } catch (error) {
    next(error)
  }
 
}

module.exports.delete_address = async (req, res,next) => {
  try {
  const token = req.cookies.jwt
  const { address } = req.body

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID

    await addressmodel
      .updateOne({ user: userId }, { $pull: { address: { _id: address } } })
      .then((data) => {
        res.json({ response: true, address: address, data: data })
      })
      .catch((err) => {
        res.json({ response: true, address: address, error: error })
      })
  }
  } catch (error) {
    next(error)
  }
  
}

module.exports.user_edit = async (req, res,next) => {
  try {
    const token = req.cookies.jwt
  res.locals.alert=false
  const {
    firstname,
    lastname,
    email,
    oldpass,
    newpass,
    newconfirmpass,
  } = req.body

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    const user = await Usermodel.findById(userId)
    const category = await categorymodel.find()
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    const checkCharacter = format.test(firstname.trim() + lastname.trim())
    res.locals.user=user
    console.log(req.body)
    if (checkCharacter) {
        res.render('user/profiledetails', {
          token: false,
          emailerr: '',
          passerr: '',
          allerr: 'firstname or lastname contain invalid character',
          category,
        })
      }  else if (
        firstname &&
        lastname &&
        email &&
        oldpass &&
        newpass &&
        newconfirmpass
      ) {
        if (newpass === newconfirmpass) {
            const isMatch = await bcrypt.compare(oldpass, user.password)
            if(isMatch){
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(newpass,salt)
            await usermodel.findByIdAndUpdate(userId,{
                firstname,
                lastname,
                email,
                phone,
                hashPassword,
            })
               res.redirect('/user_edit')
            }else{
                res.render('user/profiledetails', {
                    token: false,
                    emailerr: '',
                    passerr: 'current password is not match',
                    allerr: '',
                    category,
                  })
            }
        } else {
          res.render('user/profiledetails', {
            token: false,
            emailerr: '',
            passerr: 'password and confirm password doesnt match',
            allerr: '',
            category,
          })
          // res.send({ "status": "failed", "message": "password and confirm password doesnt match" })
        }
      } else {
        res.render('user/profiledetails', {
          token: false,
          emailerr: '',
          passerr: '',
          allerr: 'allfields required',
          category,
        })

        // res.send({ "status": "failed", "message": "All fields are required" })
      }
  } 
  } catch (error) {
    next(error)
  }
  
}
