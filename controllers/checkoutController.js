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
const addressmodel = require('../model/addressSchema')
const moment = require('moment')
const Razorpay = require('razorpay')
const crypto = require('crypto')  
const couponmodel = require('../model/couponSchema')

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

module.exports.checkout = async (req, res) => {
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
      .findOne({user: userId})
      .populate('user')
      .populate('products.item')
    const address = await addressmodel.find({ user: userId })

    res.locals.address = address || null

    if (cart != null) {
      const total = await getTotalprice(token)
      const discount = await getDiscountprice(token)
      res.locals.total = total
      res.locals.cart = cart
      res.locals.discount = discount
    }

    res.locals.wishlist = wishlist

    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    if (user.isBanned) {
      res.render('user/checkout', { token: '', alert: true, category, cart })
    } else {
      res.render('user/checkout', {
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
}
module.exports.place_order = async (req, res) => {
  try {

    const token = req.cookies.jwt
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  const userId = decoded.userID
  console.log(req.body)

  const { address, payment } = req.body
  const coupon = req.body.coupon
  console.log(coupon)
  let adrs = await addressmodel.findOne({ user: userId })
  let finaladress = adrs.address[address]

  console.log(finaladress)
  //   res.json({response:true,data:body,final:finaladress})
  let cart = await cartmodel
    .findOne({ user: userId })
    .populate('user')
    .populate('products.item')
  let status = payment === 'cod' ? 'placed' : 'pending'
  const total = await getTotalprice(token)
  let discount = await getDiscountprice(token)
  if(coupon){
    
    const coupons = await couponmodel.findOne({code:coupon.trim()})
    if(coupons){
      discount=discount+coupons.discount
      const orderObj = {
        address: {
          name: finaladress.name,
          address: finaladress.address,
          city: finaladress.city,
          state: finaladress.state,
          zip: finaladress.zip,
          phone: finaladress.phone,
          email: finaladress.email,
        },
        user: userId,
        payment,
        products: cart.products,
        totalamount: total - discount,
        status: status,
      }
      
      await ordermodel
        .create(orderObj)
        .then(async (data) => {
          console.log(data)
          const orderId = data._id.toString()
         
          if (payment == 'cod') {
            await cartmodel.updateOne({ user: userId }, { $set: { products: [] } })
            res.json({ status: true })
          } else {
            var instance = new Razorpay({
              key_id: process.env.key_id,
              key_secret: process.env.key_secret,
            })
            let amount = total-discount
            instance.orders.create({
              amount: amount*100,
              currency: 'INR',
              receipt: orderId,
           
            },(err,order)=>{
              console.log("new order:",order)
              res.json({status:false,order});
            })
          }
        })
      
    }else{
      res.json({couponerr:true,coupons})
    }
  
  }else{

  const orderObj = {
    address: {
      name: finaladress.name,
      address: finaladress.address,
      city: finaladress.city,
      state: finaladress.state,
      zip: finaladress.zip,
      phone: finaladress.phone,
      email: finaladress.email,
    },
    user: userId,
    payment,
    products: cart.products,
    totalamount: total - discount,
    status: status,
  }
  
  await ordermodel
    .create(orderObj)
    .then(async (data) => {
      console.log(data)
      const orderId = data._id.toString()
     
      if (payment == 'cod') {
        await cartmodel.updateOne({ user: userId }, { $set: { products: [] } })
        res.json({ status: true })
      } else {
        var instance = new Razorpay({
          key_id: process.env.key_id,
          key_secret: process.env.key_secret,
        })
        let amount = total-discount
        instance.orders.create({
          amount: amount*100,
          currency: 'INR',
          receipt: orderId,
       
        },(err,order)=>{
          console.log("new order:",order)
          res.json({status:false,order});
        })
      }
    })
  }
    
  } catch (error) {
    
  }
  
   
}

module.exports.place_failed_order = async (req, res) => {
  const token = req.cookies.jwt
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  const userId = decoded.userID

  const {orderId}  =req.body
  const order = await ordermodel.findById(orderId)
  let amount= order.totalamount

        var instance = new Razorpay({
          key_id: process.env.key_id,
          key_secret: process.env.key_secret,
        })
       
        instance.orders.create({
          amount: amount*100,
          currency: 'INR',
          receipt: orderId,
       
        },(err,order)=>{
          console.log("new order:",order)
          res.json({status:true,order});
        })
      }



module.exports.ordersuccess = async (req, res) => {
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
      .findOne({user: userId})
      .populate('user')
      .populate('products.item')

    const order = await ordermodel
      .find()
      .populate({
        path: 'products',
        populate: {
          path: 'item',
          model: 'products',
        },
      })
      .sort({ updatedAt: -1 })
      .limit(1)
      console.log(order)
    if (cart != null) {
    const total = await getTotalprice(token)
    const discount = await getDiscountprice(token)
    res.locals.total = total ||null
    res.locals.discount = discount ||null
    }
    res.locals.user = user || null
    res.locals.order = order ||null
    res.locals.wishlist = wishlist

    res.locals.cart = cart ||null

    
    const fullname = user.firstname + ' ' + user.lastname
    let useremail = user.email
    if (user.isBanned) {
      res.render('user/ordersuccess', {
        token: '',
        alert: true,
        category,
        cart,
      })
    } else {
      res.render('user/ordersuccess', {
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
}

module.exports.verify_payment= async (req, res) => {
  const token = req.cookies.jwt
  const { id } = req.body
if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decoded.userID
    
  console.log(req.body)
  const details = req.body
  let hmac =crypto.createHmac('sha256', process.env.key_secret)
  hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
  hmac = hmac.digest('hex')
  
const orderId=req.body['order[receipt]']
console.log(orderId)
  if(hmac==details['payment[razorpay_signature]']){
    console.log("payment successfull")
    await cartmodel.updateOne({ user: userId }, { $set: { products: [] } })
    await ordermodel.findByIdAndUpdate(orderId,{$set:{
      status:"placed"},
    }).then((data)=>{
       res.json({status:true,data})
    }).catch((err)=>{
      res.json({status:false,err})

    })
    
  }else{
    res.json({status:false}) 
    console.log("payment failed")
  }
  
}
 
}


