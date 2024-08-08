const express = require('express');
const router = express.Router();
const Service = require("../services/services.service.js");
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

const service  = new Service();
//Todos los servicios en curso
router.get('/:year',async(req,res,next)=>{
  try {
    const {year} = req.params
   const getAll = await service.getAllYear(year)
   res.status(200).json(getAll);

  } catch (error) {
   next(error)
  }
})
//Todos los servicios terminados
router.get('/all-services/:year',async(req,res,next)=>{
  try {
    const {year} = req.params
   const getAll = await service.getAllServicesYear(year)
   res.status(200).json(getAll);

  } catch (error) {
   next(error)
  }
})

router.get('/:id/:a',async(req,res,next)=>{

  const { id,a } = req.params
  try {
  const getOne = await service.getOne(id,a);
  res.status(200).json(getOne);
  } catch (error) {
    next(error)
  }




})
router.get('/reception/frotis/:a',async(req,res,next)=>{

  const { a } = req.params
  console.log('AÑO EN RUTER',a)

  try {
  const getFrotis = await service.getFrotis(a);
  res.status(200).json(getFrotis);
  } catch (error) {
    next(error)
  }




})
router.get('/reception/frotis/update-one/:id/:a',async(req,res,next)=>{

  const { a, id } = req.params


  try {
  const getFrotis = await service.changeStatusFrotis(a,id);
  res.status(200).json(getFrotis);
  } catch (error) {
    next(error)
  }




})
router.get('/frotis-list/in-progress/:a',async(req,res,next)=>{
  const {a} = req.params

  try {
  const getFrotis = await service.getFrotisList(a);
  res.status(200).json(getFrotis);
  } catch (error) {
    next(error)
  }




})
router.get('/last-inform/p/o/i/u/y/:a',async(req,res,next)=>{

  const { a } = req.params
  try {
  const getOne = await service.getLast(a);
  res.status(200).json(getOne);
  } catch (error) {
    next(error)
  }




})

router.patch('/frotis-list/in-progress/:a',upload.none(),async(req,res,next)=>{
  const {a} = req.params
  const { body } = req


  try {
  const getFrotis = await service.editFrotisList({a,body});
  res.status(200).json(getFrotis);
  } catch (error) {
    next(error)
  }




})

router.post('/',upload.any(),async(req,res,next)=>{
  try {

    const {body,params} = req

    let data ={}



    data= {...data,...body}
    console.log('[RECIBIDO]:',data)
    let create = await service.create(data);
    res.status(201).json(create);

  } catch (error) {
    next(error)
  }


})

//Creacion de informes en BD
router.post('/create-inform/:a', upload.none(),async(req,res,next)=>{
  try {

    const {body,params} = req
    console.log('[]',body)


    let create = await service.createInform(params.a, body);
    res.status(201).json(create);

  } catch (error) {
    next(error)
  }


})


router.patch('/:id',upload.any(),async(req,res,next)=>{
  const { id } = req.params
  const { body } =req


  try {
    const update = await service.updateOne(id,body);
    res.status(200).json(update);


  } catch (error) {
    next(error)
  }
})
router.delete('/:id',async(req,res,next)=>{

  const { id } = req.params

  try {

  const deleteUser = await service.deleteOne(id);

  res.status(200).json(deleteUser);

  } catch (error) {
   next(error)
  }




})


module.exports = router
