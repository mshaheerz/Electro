const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')


module.exports.checkUserAuth = async(req,res,next) => {
    let token
    const { authorization } = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            token = authorization.split(' ')[1]
            console.log("Token",token);

            // verify token
            const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY)

            //get user from token
            req.user = await usermodel.findById(userID).select('-password')
            next()
        } catch (error) {
            console.log(error);
            res.status(401).send({"status":"failed","message":"unauthorized User"})
        }
    }
    if(!token){
        res.status(403).send({"status":"failed","message":"unauthorized user no token"})
    }

}



module.exports.checkAdminAuth = async(req,res,next) => {
    let token = req.cookies.jwts
   
    if(token){
        next()
    }
    else if(!token){
        res.redirect('/admin/login')
    }

}

