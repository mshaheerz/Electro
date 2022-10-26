const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()
const port = process.env.PORT
const express  = require('express');
const createError = require('http-errors');
const userRouter = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRouter');
const logger = require('morgan');
const connectDb = require('../model/dbconnection');
const cookieParser = require("cookie-parser");
const DATABASE_URL = process.env.DATABASE_URL

const app = express();
// Clear Cache

app.use((req, res, next) => {
  console.log('cache');
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
})


 app.use(cors())
connectDb(DATABASE_URL)

app.use(logger("dev"))
app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")
app.use(cookieParser())


app.use('/',userRouter)
app.use('/admin',adminRoutes)


app.listen(port,()=>{
    console.log(`server listening at http://localhost:${port}`);
});


app.use(function (req, res, next) {
    next(createError(404));
  });


  module.exports = app;


  // error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     res.render('errors/404');
//   });