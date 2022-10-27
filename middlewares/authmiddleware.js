const jwt = require('jsonwebtoken')
const usermodel = require('../model/userschema')


module.exports.checkUserAuth = async(req,res,next) => {
   
    
    let token = req.cookies.jwt
   
    if(token){
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY );  
        const userId = decoded.userID
        console.log(userId)
        const user = await usermodel.findById(userId)
        
        if(!user.isBanned){
            next()
        }else{
           await res.cookie('jwt','',{maxAge:1});
            next()
        }
      
    }
    else if(!token){
        next()
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

