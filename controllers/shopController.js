const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const cartmodel = require('../model/cartSchema')
const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')
const { db } = require('../model/productSchema')
const { request } = require('express')

module.exports.cart = async (req, res) => {
    const token = req.cookies.jwt
    const { id } = req.body
    
    const category = await categorymodel.find()

    if (token) {


        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        const cart = await cartmodel.findOne({user:userId}).populate('user').populate('products.item')
        console.log(cart)


        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/cart', { token: "", alert: true, category,cart  })
        } else {

            res.render('user/cart', { token, fullname, useremail, alert: false, category,cart })
        }
    } else {
        res.send("login first ")

    }

}

exports.addToCart = async (req, res) => {
    const token = req.cookies.jwt
    const { productid } = req.body
    if (token) {
        let proObj={
            item:productid,
            quantity:1
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        let userCart = await cartmodel.findOne({ user: userId }).populate('user').populate('products')
        if (userCart) {
            // await cartmodel.findByIdAndUpdate(userId, { products: [productid] }).then((response) => {
            //     res.send({ "status": "success", "message": response })
            // }).catch((error) => {
            //     res.send({ "status": "error", "message": error })
            // })
            let proExist=userCart.products.findIndex(product=>product.item==productid)
            console.log(proExist)
            if(proExist !=-1){
                await cartmodel.updateOne({user:userId,'products.item':productid},
                {
                    $inc:{'products.$.quantity':1 }
                }).then((resolve)=>{
                  res.send({"status":"success","message":resolve})
                })
            }else{
            const doc = await cartmodel.findOne({user:userId}).populate('user','products')
            doc.products.push(proObj)
            await doc.save().then((response)=>{
                res.send({ "status":"success","message":"dfvd"})
            }).catch((err)=>{
                res.send({"status":"failed","message":err})
            })
        }
        } else {
            let cartObj = {
                user: (userId),
                products: [proObj]
            }
            await cartmodel.create(cartObj).then((response) => {
                res.send({ "message": response })
                // res.redirect('/')
            }).catch((error) => {
                res.send({ "status": "failed", "message": error })
            })
        }

        }else{
            res.send({"message":"login required"})
        }



        //  res.redirect('/shop')
    }

    module.exports.change_quantity= async(req,res)=>{
        console.log(req.body);
        const {product,cart,count,quantity}=req.body
        if(count==-1 && quantity==1){
            await cartmodel.updateOne({_id:cart},
            {
                $pull:{'products.$.item':product}
            }).then((response)=>{
              res.json({removeProduct:true})
       
            }).catch((err)=>{
                console.log(err)
            })
        }else{
        await cartmodel.updateOne({_id:cart,'products.item':product},
        {
            $inc:{'products.$.quantity':count }
        }).then((response)=>{
          res.json(true)
    
        })
        // res.send({"message":"f"})
         }   
    }

