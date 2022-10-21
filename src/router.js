const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

router.get('/', controller.renderHomePage)
router.get('/login', controller.renderLoginPage)


module.exports= router