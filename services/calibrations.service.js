const { ObjectId } = require('mongodb')
const { database,client} = require('./../db/mongodb')
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

    try{
      await client.connect()

      if(!year) throw new Error('Se requiere el año')

      const collection =await database.collection(`calibraciones${year}`)
      const doc = {
        ...data,
        status:'Arribo',
        year,
        isArrived:true
      }

      const result = await collection.insertOne(doc)

      return { success:true, id:result.insertedId,message:'Registro creado'}

    }finally{
      await client.close();
    }
  }

  async getAllYear(year){
    try{
      await client.connect()

      const calibrations = await database.collection(`calibraciones${year}`).find().toArray()
      return {success:true, data:calibrations, endpoint:'TODOS POR AÑO'}
    }finally{
      await client.close();

    }
  }

  async getAllYearStatus(year,status){

    try{
      await client.connect()

      const query = { status:status }
      const calibrations = await database.collection(`calibraciones${year}`).find(query).toArray()
      return {success:true, data:calibrations, endpoint:'TODOS POR AÑO y STATUS'}
    }finally{
      await client.close();

    }

  }

  async updateOs(data,year){
    const equiposIds = data.equiposList.map(id=> new ObjectId(id))
    const arrayList =data.equiposList
    delete data.equiposList
    const fechaObjCal = calcularFechaObjetivo(data.data.fechaRegistro,5)
    try{
      await client.connect()

      const result = await database.collection(`calibraciones${year}`).updateMany(
        {_id:{$in:equiposIds}},
        {$set:{datosServicio:{...data.data},status:'Con O.S.',fechaObjCal,isNotificate:false}}
      )
      console.log(`Documentos actualizados ${result.modifiedCount}`)

      const resultNewOs = await database.collection('ordenesServicio').updateOne(
        { os: data.data.os },
        {
          $push: {
            equiposList: {
              $each:arrayList
            }
          }
        },
        { upsert: true }
      );

      return { success:true, data:{result,resultNewOs}}
    }finally{
      await client.close()
    }

  }

  async updateCondiciones(data,year){
    const equiposIds = data.equiposList.map(id=> new ObjectId(id))
    delete data.equiposList
    try{
      await client.connect()
      const result = await database.collection(`calibraciones${year}`).updateMany(
        {_id:{$in:equiposIds}},
        {$set:{datosCondiciones:{...data.data},isNotificate:true}}
      )


      return { success:true, data:result}


    }finally{await client.close()}
  }

  async updateCondicionesImg(data,year,files){
    try{
      await client.connect()

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
      await client.close()
    }
  }

  async updateCalibration(data,year){
    const equiposIds = data.equiposList.map(id=> new ObjectId(id))
    delete data.equiposList
    const fechaObjEnv = calcularFechaObjetivo(data.data.fechaCal,2)


    try{
      await client.connect()

      const result = await database.collection(`calibraciones${year}`).updateMany(
        {_id:{$in:equiposIds}},
        {$set:{datosCalibracion:{...data.data},status:'Calibrado',fechaObjEnv:fechaObjEnv}}
      )

      return { success:true, data:result}
    }finally{
      await client.close()
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

  async getServiceByOs(year,os){
    try {
      client.connect()

      const calibrations = await database.collection('ordenesServicio').findOne({os:os})
      const idEquipments = calibrations.equiposList.map(id => new ObjectId(id))
      console.log(idEquipments)
      const equipments = await database.collection(`calibraciones${year}`).find({_id:{$in:idEquipments}}).toArray()



      return { success:true, data: {calibrations,equipments} }

    } catch (error) {
      return error
    }finally{
      client.close()
    }
  }
}

module.exports = Calibrations

