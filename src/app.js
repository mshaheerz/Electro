const express  = require('express');
const app = express();
const router = require('./router');
const logger = require('morgan');


app.use(logger("dev"))
app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")

app.use("/",router)

app.listen(3000,()=>{
    console.log("server now running");
});