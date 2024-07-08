//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const Laboratory = require("../services/lab.service.js");
//importar multer
const multer = require('multer');
//Creamos una instamcia de ,ulter para cuando no se reciben archivos
const uploadNone = multer();
//Para la manipulación de carpetas y archivos usamos estas instancias
const path = require('path');
const fs = require('fs');
//configuramos el storage de multer para la subida de archivos

//Definimos primero la carpeta de destino, usaremos la misma siempre pero con subcarpetas
/**MODIFICAR EN CADA ENDPOINT**/
const uploadDir = 'uploads/'
//Verificamos si la carpeta existe si no la creamos
if(!fs.existsSync(uploadDir)){
  //metodo que crea el nuevo directorio
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
//crea nuevo instancia de la clase usuario
const lab = new Laboratory();
/**
 * Endpoints (Rutas de para la funcion)
 */
router.get('/',async(req,res,next)=>{
  //usamos siempre Try catch para cachear si llega a haber algun error en las funciones asincronas
  console.log('Se toco este endpoint')
  try {
   const getAll = await lab.getAll()
   res.status(200).json(getAll);

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
          data['archivoIne']=item.filename
        }
        if(item.fieldname === 'licencia'){
          data['archivoLicencia']=item.filename
        }
      })
    }

    data= {...data,...body}
    console.log('[RECIBIDO]:',data)
    let create = await lab.create(data);
    //Si se realiza el alta enviamos un res con el status code 201 de CREADO , en formato json donde encviamos lo que llego a newUser
    res.status(201).json(create);

  } catch (error) {
    next(error)
  }


})
router.get('/:doc/:id',async(req,res,next)=>{

  //Se destructurar req.params para sacar la variable "id" que viene descrita en la url del endpoint
  const { doc,id } = req.params
  try {
    //Declaramos una variable donde recibirtemos lo que retorne el metodo getOne(id) de la instancia user
  const getOne = await lab.getOneElement(doc,id);
  //Si se recibe bien enviamos de vuelta usando res
  res.status(200).json(getOne);

  } catch (error) {
    next(error)
  }




})
router.get('/:id',async(req,res,next)=>{

    //Se destructurar req.params para sacar la variable "id" que viene descrita en la url del endpoint
    const { id } = req.params
    try {
      //Declaramos una variable donde recibirtemos lo que retorne el metodo getOne(id) de la instancia user
    const getOne = await lab.getOne(id);
    //Si se recibe bien enviamos de vuelta usando res
    res.status(200).json(getOne);

    } catch (error) {
      next(error)
    }




})
router.patch('/:doc',upload.any(),async(req,res,next)=>{
  const { doc } = req.params
  const { body,files } =req
  let data ={}
  if(files){
    files.forEach(item=>{
      if(item.fieldname === 'ine'){
        obj['archivoIne']=item.filename
      }
      if(item.fieldname === 'licencia'){
        obj['archivoLicencia']=item.filename
      }
    })
  }
  data={...body,...data}

  try {
    const update = await lab.updateOne(doc,JSON.parse(data.data));
    res.status(200).json(update);
    console.log('[message]:',update.message)

  } catch (error) {
    next(error)
  }
})
router.delete('/:id',async(req,res,next)=>{

  const { id } = req.params

  try {

  const deleteUser = await lab.deleteOne(id);

  res.status(200).json(deleteUser);

  } catch (error) {
   next(error)
  }




})









module.exports=router;


