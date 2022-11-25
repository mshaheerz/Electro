const Usermodel = require('../model/userschema')
const categorymodel = require('../model/categoryschema')
const productmodel = require('../model/productSchema')
const cartmodel = require('../model/cartSchema')
const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')
const wishlistmodel = require('../model/wishlistSchema')
const { db } = require('../model/productSchema')
const { request, response } = require('express')
const reviewmodel = require('../model/reviewSchema')
const couponmodel = require('../model/couponSchema')
const moment = require('moment')



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





module.exports.cart = async (req, res,next) => {
    try {
      const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const user = await Usermodel.findById(userId)
        const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
        res.locals.wishlist=wishlist
        if(cart){
        const total = await getTotalprice(token)
        const discount = await getDiscountprice(token)
            
        res.locals.discount= discount
        res.locals.total = total
        res.locals.cart = cart
    }else{
       
        res.locals.discount= 0
        res.locals.total = 0
        res.locals.cart = 0
    }
        // const total=cart.products.reduce((acc,cur)=>(acc+
        //     cur.item.price*cur.quantity), 0)
        // const discount=cart.products.reduce((acc,cur)=>(acc+
        //     cur.item.discount*cur.quantity), 0)

 
        console.log(cart)
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/cart', { token: "", alert: true, category, cart })
        } else {

            res.render('user/cart', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }  
    } catch (error) {
        next(error)
    }
    
}

exports.addToCart = async (req, res,next) => {
    try {
        const token = req.cookies.jwt
    const { productid } = req.body
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        let proObj = {
            item: productid,
            quantity: 1
            
        }
        
        const userId = decoded.userID
        let userCart = await cartmodel.findOne({ user: userId }).populate('user').populate('products')
        if (userCart) {

            // await cartmodel.findByIdAndUpdate(userId, { products: [productid] }).then((response) => {
            //     res.send({ "status": "success", "message": response })
            // }).catch((error) => {
            //     res.send({ "status": "error", "message": error })
            // })
            let proExist = userCart.products.findIndex(product => product.item == productid)
            console.log(proExist)
            if (proExist != -1) {
                await cartmodel.updateOne({ user: userId, 'products.item': productid },
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }).then((resolve) => {
                        // res.redirect('/shop')
                        res.json(true)
                    })
            } else {
                const doc = await cartmodel.findOne({ user: userId }).populate('user', 'products')
                doc.products.push(proObj)
                await doc.save().then((response) => {
                //   res.redirect('/shop')
                res.json(true)
                }).catch((err) => {
                    res.send({ "status": "failed", "message": err })
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

    } else {
        console.log("workedddddddddd")
        res.send(false)
    } 
    } catch (error) {
        next(error)
    }
   
    //  res.redirect('/shop')
}


module.exports.change_quantity = async (req, res,next) => {
    try {
    const token = req.cookies.jwt
    const { product, cart, count, quantity } = req.body

    if (count == -1 && quantity == 1) {
        const ss = await cartmodel.findById(cart)
        console.log(ss);
        await cartmodel.findByIdAndUpdate(cart,
            {
                $pull: { 'products': { item: product } }
            }).populate('products').then((response) => {
                res.json({ removeProduct: true })

            }).catch((err) => {
                console.log(err)
            })
    } else {
        await cartmodel.updateOne({ _id: cart, 'products.item': product },
            {
                $inc: { 'products.$.quantity': count }
            }).then( async (response) => {
                const total = await getTotalprice(token)
                const discount =await getDiscountprice(token)
             
                res.json({response:true,total:total,discount:discount})
            })
        // res.send({"message":"f"})
    } 
    } catch (error) {
        next(error)
    }
   
}


module.exports.delete_cart = async (req, res,next) => {
    try {
    const { cart,product } = req.body
    const ss = await cartmodel.findById(cart)
    console.log(ss);
    await cartmodel.findByIdAndUpdate(cart,
        {
            $pull: { 'products': { item: product } }
        }).populate('products').then((response) => {
            res.json(true)

        }).catch((err) => {
            console.log(err)
        })  
    } catch (error) {
        next(error)
    }
   
}

module.exports.delete_wishlist = async (req, res,next) => {
    try {
       const { wishlist,product } = req.body
    // const ss = await cartmodel.findById(cart)
    // console.log(ss);
    await wishlistmodel.findByIdAndUpdate(wishlist,
        {
            $pull: { 'products': { item: product } }
        }).populate('products').then((response) => {
            res.json(true)

        }).catch((err) => {
            console.log(err)
        }) 
    } catch (error) {
        next(error)
    }
    
}

module.exports.addcartproduct= async (req,res,next)=>{
    try {
    const { productid, count} = req.body
    const token = req.cookies.jwt

    if (token) {
        let proObj = {
            item: productid,
            quantity: count
        }
        console.log(proObj);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        let userCart = await cartmodel.findOne({ user: userId }).populate('user').populate('products')
        if (userCart) {
            // await cartmodel.findByIdAndUpdate(userId, { products: [productid] }).then((response) => {
            //     res.send({ "status": "success", "message": response })
            // }).catch((error) => {
            //     res.send({ "status": "error", "message": error })
            // })
            let proExist = userCart.products.findIndex(product => product.item == productid)
            console.log(proExist)
            if (proExist != -1) {
                await cartmodel.updateOne({ user: userId, 'products.item': productid },
                    {
                        $inc: { 'products.$.quantity': count }  //count added
                    }).then((resolve) => {
                        // res.redirect('/shop')
                        res.json(true)
                    })
            } else {
                const doc = await cartmodel.findOne({ user: userId }).populate('user').populate('products')
                doc.products.push(proObj)
                await doc.save().then((response) => {
                //   res.redirect('/shop')
                res.json(true)
                }).catch((err) => {
                    res.send({ "status": "failed", "message": err })
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

    } else {
        res.send("<script>alert(login required) location.reload='/login'</script>")
    }  
    } catch (error) {
        next(error)
    }
   

}

module.exports.wishlist = async(req,res,next)=>{
    try {
    const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
        res.locals.wishlist=wishlist || null
        const user = await Usermodel.findById(userId)
        const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        res.locals.cart = cart
        console.log(cart)
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/wishlist', { token: "", alert: true, category, cart })
        } else {

            res.render('user/wishlist', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    }
    } catch (error) {
        next(error)
    }
   
}



exports.addToWishlist = async (req, res,next) => {
    try {
        const token = req.cookies.jwt
    const { productid } = req.body
    if (token) {
        let proObj = {
            item: productid
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        let wishlist = await wishlistmodel.findOne({ user: userId }).populate('user').populate('products')
        if (wishlist) {
            // await cartmodel.findByIdAndUpdate(userId, { products: [productid] }).then((response) => {
            //     res.send({ "status": "success", "message": response })
            // }).catch((error) => {
            //     res.send({ "status": "error", "message": error })
            // })
            let proExist = wishlist.products.findIndex(product => product.item == productid)
            console.log(proExist)
            if (proExist != -1) {
                const docs = await wishlistmodel.findOne({ user: userId, 'products.item': productid }).populate('user').populate('products')
                console.log(docs)
                docs.products.splice(proExist,1)
                await docs.save().then((response) =>{
                      res.json({response:false,hh:true})
                })
                        // res.redirect('/shop')
                      
                 
            } else {
                const doc = await wishlistmodel.findOne({ user: userId }).populate('user', 'products')
                doc.products.push(proObj)
                await doc.save().then((response) => {
                //   res.redirect('/shop')
                res.json(true)
                }).catch((err) => {
                    res.send({ "status": "failed", "message": err })
                })
            }
        } else {
            let cartObj = {
                user: (userId),
                products: [proObj]
            }
            await wishlistmodel.create(cartObj).then((response) => {
                res.json({ null:true })
                // res.redirect('/')
            }).catch((error) => {
                res.send({ "status": "failed", "message": error })
            })
        }

    } else {
        console.log("workedddddddddd")
        res.send(false)
    }
    } catch (error) {
        next(error)
    }
    
    //  res.redirect('/shop')
}

module.exports.review= async (req, res,next) => {
    try {
    const token = req.cookies.jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID
    const {...data}=req.body
    const {productId}=req.query
    data.product=productId
    data.user=userId
    await reviewmodel.create(data)
    res.redirect(req.get('referer')); 
    } catch (error) {
        next(error)
    }
    
}


module.exports.coupons = async (req, res,next) => {
    try {
         const token = req.cookies.jwt
    const { id } = req.body
    const category = await categorymodel.find()
    if (token) {
        const coupons = await couponmodel.find({status:'enabled'})
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID
        const wishlist = await wishlistmodel.findOne({user:userId}).populate('user').populate('products.item')
        res.locals.wishlist=wishlist || null
        const user = await Usermodel.findById(userId)
        const cart = await cartmodel.findOne({ user: userId }).populate('user').populate('products.item')
        res.locals.coupons = coupons||null
        res.locals.cart = cart ||null
        res.locals.moment=moment
        console.log(cart)
        const fullname = user.firstname + " " + user.lastname
        let useremail = user.email
        if (user.isBanned) {
            res.render('user/coupons', { token: "", alert: true, category, cart })
        } else {

            res.render('user/coupons', { token, fullname, useremail, alert: false, category, cart })
        }
    } else {
        res.send('<script>alert("Login first "); window.location.href = "/login"; </script>')

    } 
    } catch (error) {
        next(error)
    }
  
}