const Usermodel = require("../model/userschema")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const transporter = require("../config/emailConfig")
const validatePhoneNumber = require('validate-phone-number-node-js');
const categorymodel = require('../model/categoryschema')

const { reset } = require("nodemon")




class userController {

    //signup 



    static userRegistration = async (req, res) => {
        const { firstname, lastname, email, phone, password, passwordone } = req.body
        const user = await Usermodel.findOne({ email: email })
        const category = await categorymodel.find()
        const checkPhone = validatePhoneNumber.validate(phone);
        console.log(checkPhone);
        if (user) {
            res.render("user/signup", { token: false, emailerr: "email already exists login?", passerr: "", allerr: "" })
            // res.send({ "status": "failed", "message": "email alreddy exists" })
        } else {

            const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            const checkCharacter = format.test(firstname + lastname)
            if (checkCharacter) {
                res.render("user/signup", { token: false, emailerr: "", passerr: "", allerr: "firstname or lastname contain invalid character",category })

            }else if(!checkPhone){
                
                res.render("user/signup", { token: false, emailerr: "", passerr: "", allerr: "Enter valid phone number",category })

            }

            else if (firstname && lastname && email && phone && password && passwordone) {
                if (password === passwordone) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const doc = new Usermodel({
                            firstname: firstname,
                            lastname: lastname,
                            email: email,
                            phone: phone,
                            password: hashPassword,
                        })
                        await doc.save()
                        const saved_user = await Usermodel.findOne({ email: email })
                        // genarate JWT Token
                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.cookie('jwt', token, { httpOnly: true });
                        res.redirect('/')
                        // res.send({ "status": "success", "message": "registration success","token":token })


                    } catch (error) {
                        console.log(error);
                        res.send({ "status": "failed", "message": "unable to register" })
                    }

                } else {
                    res.render("user/signup", { token: false, emailerr: "", passerr: "password and confirm password doesnt match", allerr: "",category })
                    // res.send({ "status": "failed", "message": "password and confirm password doesnt match" })

                }
            } else {
                res.render("user/signup", { token: false, emailerr: "", passerr: "", allerr: "allfields required",category })

                // res.send({ "status": "failed", "message": "All fields are required" })
            }
        }
    }


    //signin
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await Usermodel.findOne({ email: email })
                const category = await categorymodel.find()
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)
                    if (user.email === email && isMatch) {

                        // genarate JWT Token
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.cookie('jwt', token, { httpOnly: true });
                        res.redirect('/')
                        // res.send({ "status": "success", "message": "login success","token":token })
                    } else {
                        res.render("user/login", { token: false, emailerr: "", passerr: "invalid email or password", allerr: "",category })
                        // res.send({ "status": "failed", "message": "invalid email or password" })

                    }


                } else {
                        res.render("user/login", { token: false, emailerr: "your not registered user", passerr: "", allerr: "",category })
                }
            } else {
                res.render("user/login", { token: false, emailerr: "", passerr: "", allerr: "All fields are required",category })

            }
        } catch (error) {
            res.send({ "status": "failed", "message": error })
            console.log(error);
        }
    }


    // password change
    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.send({ "status": "failed", "message": "new password and confirm new password doesnt match" })

            } else {
                const salt = await bcrypt.genSalt(10)
                const newhashPassword = await bcrypt.hash(password, salt)
                await usermodel.findByIdAndUpdate(req.user._id, { $set: { password: newhashPassword } })

                res.send({ "status": "success", "message": "password changed successfully" })
            }

        } else {
            res.send({ "status": "failed", "message": "all fields are required" })
        }
    }


    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await Usermodel.findOne({ email: email })

            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
                const link = `http://127.0.0.1:8000/user/reset/${user._id}/${token}`
                console.log(link);
                //send email
                try {
                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject: "ELECTRO - password reset Link",
                        html: `<a href=${link}>CLICK HERE</a> to Reset your password`

                    })
                    res.send({ "status": "success", "message": "password reset email sended sucessfully check email", 'info': info })



                } catch (error) {
                    res.send({ "status": "failed", "message": "other error" })
                    console.log(error);
                }


            } else {
                res.send({ "status": "failed", "message": "Email does not exists" })

            }
        } else {
            res.send({ "status": "failed", "message": "Email Fields are required" })
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await Usermodel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.send({ "status": "failed", "message": "password and confirmatio  pass not match" })

                } else {
                    const salt = await bcrypt.genSalt(10)
                    const newhashPassword = await bcrypt.hash(password, salt)
                    await usermodel.findByIdAndUpdate(user._id, { $set: { password: newhashPassword } })
                    res.send({ "status": "success", "message": "password reset success fully" })

                }
            } else {
                res.send({ "status": "failed", "message": "All fields are Required" })
            }
        } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Invalid Token" })

        }
    }
}
module.exports = userController
