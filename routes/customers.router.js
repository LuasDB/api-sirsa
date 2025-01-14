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
router.post('/', upload.any(), async (req, res, next) => {
  const { body } = req;
  try {
    const newCustomer = await customer.create(body);

    if (newCustomer.exists) {
      // Cliente ya existe, retorna un código 409 con un mensaje claro
      return res.status(409).json({
        success: false,
        message: 'El cliente ya se encuentra registrado'
      });
    }

    if (newCustomer.success) {
      // Cliente creado exitosamente
      return res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente'
      });
    }

  } catch (error) {
    // Error general en el servidor
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

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
