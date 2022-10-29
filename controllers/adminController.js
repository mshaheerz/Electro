const adminmodel = require('../model/adminschema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usermodel = require('../model/userschema');
const categorymodel = require('../model/categoryschema')
const moment = require('moment');
const { reset } = require('nodemon');
const { request } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const { encode } = require('punycode');



//helper function
async function admincheck(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const adminID = decoded.adminID
    console.log(adminID);
    const admin = await adminmodel.findById(adminID)
    const adminemail = admin.email
    return adminemail
}

module.exports.admin_login = async (req, res) => {
    const token = req.cookies.jwts
    if (token) {
       
        res.redirect('/admin')
    } else {
        res.render('admin/login')
    }


}


module.exports.admin_home = async (req, res) => {
    const token = req.cookies.jwts
    if (token) {
        adminemail = await admincheck(token)

        res.render('admin/index', { adminemail: adminemail })
    } else {
        res.render('admin/login');
    }

}
module.exports.admin_login_post = async (req, res) => {
    const { email, password } = req.body
    const admin = await adminmodel.findOne({ email: email })
    console.log(admin);
    if (admin != null) {
        if (email && password) {

            const isMatch = await bcrypt.compare(password, admin.password)
            if (admin.email === email && isMatch) {
                const token = jwt.sign({ adminID: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                res.cookie('jwts', token, { httpOnly: true });
                res.redirect('/admin')
            } else {

                res.send({ "status": "failed", "message": "email or password mismatch" })
            }
        } else {
            res.send({ "status": "failed", "message": "all fieldsa re required" })


        }
    } else {
        res.send({ "status": "failed", "message": "your not registered admin" })
    }
}

module.exports.logout_get = (req,res) =>{
    res.cookie('jwts','',{maxAge:1});
    res.redirect('/admin/login');
}



//user 
module.exports.user_list = async (req,res) =>{
    user = await usermodel.find({})
    const token = req.cookies.jwts
    adminemail = await admincheck(token)
    res.render('admin/users',{user,adminemail: adminemail,moment:moment})
}

module.exports.flag_user = async (req,res)=>{
    const {email}=req.query
    console.log(email);
    try {
        await usermodel.updateOne({email:email},{isBanned: true})
        res.redirect('/admin/users_list')
    } catch (error) {
        res.send({"status":"failed","message":error.message});
    }
   
}

module.exports.remove_user_flag = async (req,res)=>{
    const {email}=req.query
    try{
        await usermodel.updateOne({email:email},{isBanned: false})
        res.redirect('/admin/users_list')
    } catch (error){
        res.send({"status":"failed","message":error.message});
    }
}


module.exports.user_details = async (req,res)=>{
    const token = req.cookies.jwts
    try {
         adminemail = await admincheck(token)
         const { email }=req.query
         user =  await usermodel.findOne({email})
         console.log(user);
         res.render('admin/userdetails',{adminemail:adminemail,user,moment})
    } catch (error) {
        res.send({"status":"failed","message":error.message})
    }
   
   
}
module.exports.delete_user = async (req,res)=>{
    const {email}=req.query
    try{
        await usermodel.deleteOne({email:email})
        res.redirect('/admin/users_list')
    } catch (error){
        res.send({"status":"failed","message":error.message});
    }
}
module.exports.category_list = async (req,res)=>{
    const token = req.cookies.jwts
 
    const category =await categorymodel.find({})
    

    adminemail = await admincheck(token)
    res.render('admin/categorylist',{category,adminemail:adminemail})
}
module.exports.category_details = async (req,res)=>{
    const {id} = req.query
    const category = categorymodel. findOne({_id:id})
    res.render('admin/categorylist',category)
}
module.exports.delete_category = async (req,res)=>{
    try {
        const {id}=req.query
        await categorymodel.findByIdAndDelete({_id:id})
        
        const folder= path.join(__dirname, '..',`public/admin/serverimages/category`,`${id}.png`)
        fs.rmSync(folder,{
         force:true,
        })
       
        res.redirect('/admin/category_list')
    } catch (error) {
        res.send({"status":"failed", "message":error.message})
    }
   
}

module.exports.edit_category = async(req,res)=>{
    const {id}=req.query
    const {category_name,category_description}=req.body
    await categorymodel.findByIdAndUpdate(id,{category_name:category_name,
        category_description:category_description
    })
    res.redirect('/admin/category_list')
}
module.exports.add_category = async (req,res,next)=>{
    // const {category_name,category_description}= req.body 
    const category_thumbnail = req.file 
    
    if(!category_thumbnail){
        const error = new Error('Please choose files')
        error.httpStatusCode =400;
        return next(error)
    }

    // const category =  await categorymodel.create({category_name,category_description,category_thumbnail})
    // res.redirect('/admin/category_list')

    //convert images into base64 encoding

    // let imgArray = files.map[(file)=>{
    //     let img = fs.readFileSync(file.path)
    //     return encode_image = img.toString('base64')
    // }]
    //let result= imgArray.map[(src,index)=>{
    //     let finalimg ={
    //         filename:category_thumbnail[index].originalname,
    //         contentType:category_thumbnail[index].mimetype,
    //         imageBase64:src
    //     }
    // }]
    // let newUpload = new categorymodel(finalimage)
    // return newUpload.save().then(()=>{
    //     return{msg:'uploaded successfully...'}
    // }).catch(error =>{
    //     if(error){
    //        if(error.name === 'mongoerror' && error.code ===11000) {
    //         return Promise.reject({error:"duplicate file already exists"})
    //        }
    //        return Promise.reject({error:"error"})
    //     }
    // })

      const {category_name,category_description}= req.body
    let img =  fs.readFileSync(category_thumbnail.path)
     const encode_image = img.toString('base64') 
    let newUpload = new categorymodel({ category_name:category_name,
        category_description:category_description,
        category_thumbnail: category_thumbnail.originalname,
        contentType:category_thumbnail.mimetype,
        imageBase64:encode_image})
    return newUpload.save().then(()=>{
        res.redirect('/admin/category_list')
    }).catch(error =>{
            if(error){
               if(error.name === 'mongoerror' && error.code ===11000) {
                return Promise.reject({error:"duplicate file already exists"})
               }
               return Promise.reject({error:"error"})
            }
        })
}

module.exports.add_products = async (req,res)=>{
    const token = req.cookies.jwts
    adminemail = await admincheck(token)
    category = await categorymodel.find()
    res.render('admin/products',{adminemail,category})
}

module.exports.add_products_post = async (req,res,next)=>{
    const images =  req.files 
    
    res.send({"oops":req.body,"haha":req.files})
}