const { ObjectId } = require('mongodb')
const { database,client} = require('./../db/mongodb')
const Boom = require('@hapi/boom')
const calcularFechaObjetivo = require('./../functions/getDatesObj')
const nodemailer = require('nodemailer')
const { emailNotificationTemplate } = require('./../functions/htmlTemplates')


const transporter = nodemailer.createTransport({
  host: 'mail.siradiacion.com.mx',
  port: 465,
  secure: true,
  auth: {
      user: 'saul.delafuente@siradiacion.com.mx',
      pass: 'Sir249&Tec-389'
    }
})


class Calibrations{
  constructor(){
    this.client = client
  }

  async create(data,year){
    console.log('Data a registrar',data)

    try{

      if(!year) throw Boom.badData('Se requiere el año')


      const collection =await database.collection(`servicios${year}`)
      const doc = {
        ...data,
        registradoPor:JSON.parse(data.registradoPor),
        status:'Arribo',
        year,
        isArrived:true
      }


      const result = await collection.insertOne(doc)

      return { doc,result}

    }catch(error){
      if (Boom.isBoom(error)) {
        throw error
      }
      throw Boom.badImplementation('Error al obtener la colección', error);
    }
  }

  async getAllYear(year){
    try{
      const calibrations = await database.collection(`servicios${year}`).find().toArray()
      return {success:true, data:calibrations, endpoint:'TODOS POR AÑO'}
    }catch(error){
      if (Boom.isBoom(error)) {
        throw error
      }
      throw Boom.badImplementation('Error al obtener la colección', error);
    }
  }

  async getAllYearStatus(year,status){

    try{

      const query = { status:status }
      const calibrations = await database.collection(`calibraciones${year}`).find(query).toArray()
      return {success:true, data:calibrations, endpoint:'TODOS POR AÑO y STATUS'}
    }catch(error){
      if (Boom.isBoom(error)) {
        throw error
      }
      throw Boom.badImplementation('Error al obtener la colección', error);
    }

  }

  async updateOs(data, year) {
    const equiposIds = data.equiposList.map(id => new ObjectId(id));
    console.log(equiposIds);
    const arrayList = data.equiposList;

    delete data.equiposList;
    const fechaObjCal = calcularFechaObjetivo(data.data.fechaRegistro, 5);

    try {
      let isOs = false
      if(data.data.osFisica === 'no'){
        isOs=true
      }

      const newData ={
        status: 'Con O.S.',
        fechaObjCal,
        isOs,
        servicio:'calibracion'
      }

      const result = await database.collection(`servicios${year}`).updateMany(
        { _id: { $in: equiposIds } },
        { $set: { datosServicio: { ...data.data },...newData  } }
      );
      console.log(`Documentos actualizados ${result.modifiedCount}`);


        const collections = await database.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === 'ordenesServicio');

        if (!collectionExists) {
            console.log('La colección "ordenesServicio" no existe. Creándola...');
            await database.collection('ordenesServicio').insertOne({ os: data.data.os, equiposList: [] });
        }

        const resultOs = await database.collection('ordenesServicio').updateOne(
            { os: data.data.os },
            { $addToSet: { equiposList: { $each: arrayList } } }
        );
      return { success: true, message: `Documentos actualizados ${result.modifiedCount}, ordenes modificadas:${resultOs.modifiedCount}` };
    }catch(error){
        if (Boom.isBoom(error)) {
          throw error
        }
        throw Boom.badImplementation('Error al obtener la colección', error);
      }
  }

  async receivedOs(data,year){

  }

  async updateCondiciones(data,year,files){
    const body = JSON.parse(data.data)
    const equiposList = JSON.parse(data.equiposList)
    console.log(files)


    const equiposIds = equiposList.map(id=> new ObjectId(id))

    try{
      const result = await database.collection(`servicios${year}`).updateMany(
        {_id:{$in:equiposIds}},
        {$set:{datosCondiciones:{...body,fotos:files},isConditions:true}}
      )
      return { success:true, data:result}
    }catch(error){
      if (Boom.isBoom(error)) {
        throw error
      }
      throw Boom.badImplementation('Error al obtener la colección', error);
    }
  }

  async updateCondicionesImg(data,year,files){
    try{

      let images=[]
      if(files && files.length){
        images = files.map(file=>({path:file.path,filename:file.filename}))
      }

      const result = await database.collection(`calibraciones${year}`).updateOne({
        _id:new ObjectId(data.id)
      },{
        $set:{
          'datosCondiciones.img':images
        }
      })

      return { success:true, data:result}

    }finally{
    }
  }

  async updateCalibration(data,year){
    const equiposIds = data.equiposList.map(id=> new ObjectId(id))
    delete data.equiposList
    const fechaObjEnv = calcularFechaObjetivo(data.data.fechaCal,2)


    try{

      const result = await database.collection(`calibraciones${year}`).updateMany(
        {_id:{$in:equiposIds}},
        {$set:{datosCalibracion:{...data.data},status:'Calibrado',fechaObjEnv:fechaObjEnv}}
      )

      return { success:true, data:result}
    }finally{
    }

  }

  async notificateCustomer(body,y){
    const { os, year, correo } = body
    console.log(body)



    const link = `${process.env.URL_APP}viewStatusOrder/${os}`

    const transporter = nodemailer.createTransport({
      host: 'mail.siradiacion.com.mx',
      port: 465,
      secure: true,
      auth: {
          user: 'saul.delafuente@siradiacion.com.mx',
          pass: 'Sir249&Tec-389'
        }
    })


    const optionsMail = {
      from:'saul.delafuente@siradiacion.com.mx',
      to:[correo,'saul.delafuente@siradiacion.com.mx'],
      subject:'Arribo de equipo a Laboratorio',
      html: emailNotificationTemplate(link),
    }
    transporter.sendMail(optionsMail,(error,info)=>{
      if (error) {
        console.error('Error al enviar el correo:', error);
      } else {

        console.log('Correo enviado:', info);
      }
    })

    return { success: true, data:{os,correo,link} }

  }

  async getEquipmentsByOs(year,os){
    try {
      const equipmentsList = await database.collection('ordenesServicio').find({os}).toArray()
      const ids = equipmentsList.map(item=>{
        return item.equipmentsList.map(id=>new ObjectId(id))
      })
      console.log(ids)
      const docs = await database.collection(`servicios${year}`)
      .find({_id:{$in: ids},isOs:false})
      .project({cliente:1,marca:1,modelo:1})
      .toArray()



      return docs
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('No se pudo traer la información',error)
    }
  }

  async getServiceByOs(year,os){
    try {

      const calibrations = await database.collection('ordenesServicio').findOne({os:os})
      const idEquipments = calibrations.equiposList.map(id => new ObjectId(id))
      console.log(idEquipments)
      const equipments = await database.collection(`servicios${year}`).find({_id:{$in:idEquipments}}).toArray()



      return { success:true, data: {calibrations,equipments} }

    } catch (error) {
      return error
    }
  }
}
module.exports = Calibrations

