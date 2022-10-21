exports.renderHomePage = (req,res) =>{
    res.render("user/index", {title:"scen aaano"})
  

}

exports.renderLoginPage = (req,res) =>{
    // res.render("About")
    res.render('user/login')

}