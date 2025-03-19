const express = require('express')
const multer = require('multer')
const Calibrations = require('./../services/calibrations.service')
const path = require('path');
const fs = require('fs');

const router = express.Router()

// Configuración del almacenamiento con multer
const storageCondiciones = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = req.params.year
    console.log('QUE AÑO',year)
    if (!year) {
      return cb(new Error('El campo "year" es requerido para subir archivos.'));
    }

    const uploadDir = path.join('uploads/calibraciones', year.toString(), 'condicionesFisicas');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});
const uploadCondiciones = multer({ storage: storageCondiciones });

const calibration = new Calibrations()

const calibrationsRouter = (io)=>{

router.get('/:year',async (req,res,next)=>{
  const { year } = req.params
  try {
    const getAllCal = await calibration.getAllYear(year)
    io.emit('response','Se consultaron las bases de datos')
    res.status(200).json(getAllCal)
  } catch (error) {
    next(error)
  }
})

router.get('/:year/:status',async (req,res,next)=>{
  const { year, status } = req.params
  try {
    const getAllCal = await calibration.getAllYearStatus(year,status)
    res.status(200).json(getAllCal)
  } catch (error) {
    next(error)
  }
})

router.get('/:year/os-recived/:os',async(req,res,next)=>{
  const {year,os} = req.params
  try {
    const getEquipmentsOs = await calibration.getEquipmentsByOs(year,os)
    res.status(200).json({
      success:true,
      data:getEquipmentsOs
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:year/orden-servicio/:os',async (req,res,next)=>{
  const { year, os } = req.params
  try {
    const getAllCal = await calibration.getServiceByOs(year,os)
    res.status(200).json(getAllCal)
  } catch (error) {
    next(error)
  }
})

router.post('/:year',async (req,res,next)=>{
  const { body, params } = req
  try {
    const newCalibration = await calibration.create(body,params.year)
    io.emit('newRegister',{
      type:'nuevo',
      record:{...newCalibration.doc,_id:newCalibration.result.insertedId}
    })
    res.status(201).json({
      success:true,message:'Registro creado'})
  } catch (error) {
    next(error)
  }
})

router.patch('/:year/update-os/',async (req,res,next)=>{
  const { body,params } = req
  try {
    const newCalibration = await calibration.updateOs(body,params.year)
    io.emit('update',{
      type:'os'
    })

    res.status(201).json(newCalibration)
  } catch (error) {
    next(error)
  }
})

router.patch('/:year/received-os/',async (req,res,next)=>{
  const { body,params } = req
  try {
    const newCalibration = await calibration.receivedOs(body,params.year)
    io.emit('update',{
      type:'os'
    })

    res.status(201).json(newCalibration)
  } catch (error) {
    next(error)
  }
})


router.patch('/:year/update-condiciones/',uploadCondiciones.any(),async (req,res,next)=>{
  const { body,params,files } = req
  try {
    const newCalibration = await calibration.updateCondiciones(body,params.year,files)
    io.emit('update',{type:'condiciones'})

    res.status(201).json(newCalibration)
  } catch (error) {
    next(error)
  }
})

router.patch('/:year/notificate-customer/',async (req,res,next)=>{
  const { body,params } = req
  try {
    const newCalibration = await calibration.notificateCustomer(body,params.year)
    res.status(201).json(newCalibration)
  } catch (error) {
    next(error)
  }
})

router.patch('/:year/update-calibration/',async (req,res,next)=>{
  const { body,params } = req
  try {
    const newCalibration = await calibration.updateCalibration(body,params.year)
    res.status(201).json(newCalibration)
  } catch (error) {
    next(error)
  }
})

return router

}




module.exports= calibrationsRouter

