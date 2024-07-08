const express = require('express');
const router = express.Router();
const Customer = require("../services/customers.service.js");
const multer = require('multer');
const uploadNone = multer();
const path = require('path');
const fs = require('fs');
const uploadDir = 'uploads/request'
if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir,{recursive:true})
}

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,uploadDir)
  },
  filename:(req,file,cb)=>{
    const identificador = Date.now() + '-' + Math.round(Math.random()*1E9)


    cb(null,file.fieldname + '_' + identificador + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });

const customer  = new Customer();

router.get('/',async(req,res,next)=>{
  try {
   const getAll = await customer.getAll()
   res.status(200).json(getAll);

  } catch (error) {
   next(error)
  }
})
router.get('/:id',async(req,res,next)=>{

  const { id } = req.params
  try {
  const getOne = await customer.getOne(id);
  res.status(200).json(getOne);
  } catch (error) {
    next(error)
  }




})
router.post('/',upload.any(),async(req,res,next)=>{
  try {

    const {body,files} = req
    let data ={}


    if(files){
      console.log('[FILE RECIVED]')
      files.forEach(item=>{
        if(item.fieldname === 'ine'){
          data['none']=item.filename
        }
        if(item.fieldname === 'licencia'){
          data['none']=item.filename
        }
      })
    }

    data= {...data,...body}
    console.log('[RECIBIDO]:',data)
    let create = await customer.create(data);
    //Si se realiza el alta enviamos un res con el status code 201 de CREADO , en formato json donde encviamos lo que llego a newUser
    res.status(201).json(create);

  } catch (error) {
    next(error)
  }


})

router.patch('/:id',upload.any(),async(req,res,next)=>{
  const { id } = req.params
  const { body } =req
  let data ={}

  data={...body,...data}

  try {
    const update = await customer.updateOne(id,data);
    res.status(200).json(update);
    console.log('[message]:',update.message)

  } catch (error) {
    next(error)
  }
})
router.delete('/:id',async(req,res,next)=>{

  const { id } = req.params

  try {

  const deleteUser = await customer.deleteOne(id);

  res.status(200).json(deleteUser);

  } catch (error) {
   next(error)
  }




})


module.exports = router
