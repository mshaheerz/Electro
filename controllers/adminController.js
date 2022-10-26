const adminmodel = require('../model/adminschema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


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
