const multer = require('multer');
const path = require('path');

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{cb(null,'./public/uploads/')},
    filename: (req, file, cb)=>{     
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))  
    }
  })
exports.upload = multer({
    storage:storage
})
//if multiple imag specify array  eg: .array('category_thumbnail',3)
  //group end
