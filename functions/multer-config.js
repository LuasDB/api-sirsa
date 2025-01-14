const multer = require('multer')
const path = require('path')
const fs = require('fs')
const utf8 = require('utf8');

const storage = (collection)=>{
  const uploadPath = `uploads/${collection}`

  if(!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath,{recursive:true})
  }

  return multer.diskStorage({
    destination:(req, file,cb)=>{
      cb(null,uploadPath)
    },
    filename:(req,file,cb)=>{
      console.log(file.originalname)
      cb(null,utf8.decode(file.originalname).normalize('NFC'))
    }
  })
}

const uploadInform = (collection)=>{
  return multer({storage:storage(collection)})
}

module.exports = uploadInform;
