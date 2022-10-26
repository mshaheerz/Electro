const Usermodel = require('../model/userschema')
const jwt = require('jsonwebtoken')

module.exports.home_page = async(req,res)=>{ 
    const token = req.cookies.jwt

    if(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY );  
            const userId = decoded.userID
            const user = await Usermodel.findById(userId)
            const fullname = user.firstname +" "+ user.lastname
             let useremail = user.email
          
    res.render('user/index',{token,fullname,useremail})
   }else{
    res.render('user/index',{token})
   }
}

module.exports.signup_post = (req,res) =>{
    res.send("login post")
    
  

}

module.exports.login_get = (req,res) =>{
    const token = req.cookies.jwt
    if(token){
        res.redirect("/")
    }else{
    res.render("user/login", {token:false,emailerr:'',passerr:"",allerr:""})
    }

}

module.exports.logout_get = (req,res) =>{
    res.cookie('jwt','',{maxAge:1});
    res.redirect('/');
}



 

