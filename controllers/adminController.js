const adminmodel = require('../model/adminschema')
const jwt = require('jsonwebtoken')

module.exports.admin_login = (req,res)=>{
    res.render('admin/index')

}