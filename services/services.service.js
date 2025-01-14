const { experimentalSetDeliveryMetricsExportedToBigQueryEnabled } = require('firebase/messaging/sw');
const { db,admin } = require('../db/firebase');
const { connectStorageEmulator } = require('firebase/storage');
const {getFromCache,setInCache,updateInCache} = require('./../db/cache')
const calcularFechaObjetivo = require('./../functions/getDatesObj')




let countLecturas =0

function generateUID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uid += characters[randomIndex];
  }
  return uid;
}





class Services{
  constructor(){
    this.collection='serviciosPf'
  }

  async create(data){

    // try {

    //   const fetch = await db.collection(`${this.collection}${data.ano}`).add(data)

    //   if(fetch.id) return {success:true, data: fetch, message:'Creado'}

    // } catch (error) {
    //   return {success:false, message:`Algo salio mal. [ERROR]: ${error}`}
    // }

    try {
      data['id'] =  generateUID(20)
      const services = await db.collection('services').doc(`serviciosPf${data.ano}`).get()
      if(!services.exists){
        await db.collection('services').doc(`serviciosPf${data.ano}`).set({
          servicios:[data]
        })
      }else{
        const serviciosArray = services.data().servicios || []
        serviciosArray.push(data)
        await db.collection('services').doc(`serviciosPf${data.ano}`).update({
          servicios:serviciosArray
        })

         return {success:true, data: fetch, message:'Creado'}
      }
    } catch (error) {
      return {success:false, message:`Algo salio mal. [ERROR]: ${error}`}
    }




  }
  async getAllYear(year){

    // const cachedProducts = await getFromCache(`serviciosPf${year}`);
    // if (cachedProducts.length) {
    // return {success:true, data:cachedProducts,message:'Desde cache firestore'}
    // }
    // try {
    //   const fetch = await db.collection(`${this.collection}${year}`).where('status','==','ACTIVO').get();
    //   const services = fetch.docs.map(item=>({id:item.id,...item.data()}))
    //   await setInCache(`serviciosPf${year}`, services);
    //   return {success:true, data:services,message:'Desde Firestore'}
    // } catch (error) {
    //   return { success:false, message:`Algo salio mal: [ERROR] ${error}`}
    // }

    try {
      const getAll = await db.collection('services').doc(`serviciosPf${year}`).get()
      if(!getAll.exists){
        await db.collection('services').doc(`serviciosPf${year}`).set({
          servicios:[]
        })
        return []
      }
      return [...getAll.data().servicios]

    } catch (error) {
      return { error }
    }
  }

  async getActives(year){
    try {
      const services =await this.getAllYear(year)

      const servicesActives = services.filter(item => item.status === 'ACTIVO')


      return [...servicesActives]


    } catch (error) {
      return error
    }
  }
  async getOne(id,year){
    try {
      const services = await this.getAllYear(year)
      const index = services.findIndex(item => item.id === id)
      return services[index]

    } catch (error) {
      return { success:false, message:'No se encontro'}
    }



  }
  async updateOne(id,newData,year){

    // try {
    //  await db.collection(this.collection + newData.ano).doc(id).update(newData)
    //  updateInCache(this.collection + newData.ano,newData,id)
    //  return { success:true, message:'Actualizado'}

    // } catch (error) {
    //   return {success: false, message:'Algo salio mal al actualizar'}
    // }

    try {
      const services = await this.getAllYear(year)
      console.log(services)
    //   console.log('DATOS A ACTUALIZAR')
    //   console.log('ID',id)
    //   console.log('NUEVO',newData)
    //   console.log('AÑO',year)


    const index = services.findIndex(item => item.id === id)
    if(index === -1){
      console.error('NO ENCONTRADO')
      return
    }

    services[index] = { ...services[index],...newData }


    await db.collection('services').doc(`serviciosPf${year}`).update({
      servicios:services
    })

    return { success:true, message:'Actualizado' ,services:services}

    } catch (error) {
      return {success: false, message:'Algo salio mal al actualizar'}
    }


  }
  async deleteOne(id){

  }

  async getFrotis(a){

    try {

      const services = await this.getActives(a)



      const allFrotis = services.flatMap(item =>
        item.frotis.map(frotis => ({
          os: item.os,
          cliente: item.razon_social,
          ...frotis
        }))
      );

      return { success:true, data:allFrotis}

    } catch (error) {
      return { success:false, message:'No se obtuvieron'}
    }


  }
  async changeStatusFrotis(a,idFrotis){

    try {
      const services = await this.getActives(a);


      // services.map(async(record) => {
      //   record.frotis = record.frotis.flatMap(frotis => {
      //     if (frotis.id === idFrotis) {

      //       return { ...frotis, status: 'Recibido' };
      //     }
      //     return frotis;
      //   });

      //   if(record.frotis.some(item=>item.status === 'Registro')){

      //   }else{
      //     record['status']='En curso'
      //   }

      //   console.log('[Para update]',record.id,record,record.ano)
      //   await this.updateOne(record.id,record,record.ano)
      // });


      const indexService = services.findIndex(item => item.frotis.some(froti => froti.id === idFrotis))
      const indexFrotis = services[indexService].frotis.findIndex(item=>item.id === idFrotis)
      let frotis = services[indexService].frotis[indexFrotis]
      frotis = {...frotis, status:'Recibido',fecha_recibido:new Date().toISOString(),fecha_objetivo:calcularFechaObjetivo(new Date(),5).toISOString()}

      services[indexService].frotis[indexFrotis]=frotis
      if(!services[indexService].frotis.some(item=>item.status === 'Registro')){
        services[indexService]['status']='En curso'
      }

      const res = await this.updateOne(services[indexService].id,services[indexService],services[indexService].ano)
      if(res.success){
        return { success:true,message:'Actualizado',servi: res.services}

      }


    } catch (error) {
      return { success:false, message: ' No se registro' + error}
    }
  }
  async getFrotisList(a){

    // const res = await db.collection(this.collection + a).where('status','==','En curso').get()
    // const listado = res.docs.map(item => ({id:item.id,...item.data()}))

    const services = await this.getAllYear(a)
    console.log('[LOG]',services)

    const listado = services.filter(item => item.status === 'En curso')



    const grouped = {};

     listado.forEach(item => {
    item.frotis.forEach(frotis => {
      if(frotis.status !== 'Realizado'){
        const key = `${item.os}-${frotis.fecha_frotis}-${frotis.isotopo}`;
        if (!grouped[key]) {
          grouped[key] = {
            os: item.os,
            razon_social: item.razon_social,
            isotopo: frotis.isotopo,
            fecha_frotis: frotis.fecha_frotis,
            frotis: [],
            data_service:item
          };
        }
        grouped[key].frotis.push(frotis);
      }

      }
    )
    });
    const groupedFrotis= Object.values(grouped);

    return { success:true, data: groupedFrotis}

  }
  async editFrotisList({a,body}){
    const frotisRealizados= JSON.parse(body.frotisRealizados)
    const id_doc = body.id_service
    console.log('[X]--------------------------')
    console.log('[id]',id_doc)

    const service = await this.getOne(id_doc,a)
    const prevFrotis = service.frotis
    console.log('[Service]',service)

    const newArrayFrotis = prevFrotis.map(item=>{
      const modifiedItem = frotisRealizados.find(modItem => modItem.id === item.id)
      return modifiedItem ? modifiedItem : item

    })

    try {
      await this.updateOne(id_doc,{frotis:newArrayFrotis},a)

    return { success:true,message:'REGISTRADOS'}

    } catch (error) {
      return { success:false,message:`Algo salio mal. Error: ${error}`}
    }







  }
  async createInform(a,data){
    const informs = await db.collection('informes').doc(`informesPf${a}`).get()
    const informes = informs.data()
    let arrayinforms =[]
      if(informs.exists){
        arrayinforms = informes.informes
      }else{
        await db.collection('informes').doc(`informesPf${a}`).set({informes:[]})
      }

    data.forEach(async(item)=>{
      arrayinforms.push(item)
    })


    await db.collection('informes').doc(`informesPf${a}`).update({informes:arrayinforms})


    return { success: true}

  }
  async getAllServicesYear(a){

    try {
      const informes = await db.collection('informes').doc(`informesPf${a}`).get()
      if(!informes.exists){
        return {success:true, data:[]}
      }

      return {success:true, data:informes.data().informes,message:'Directamente desde firstore'}
    } catch (error) {
      return { success:false, message:`Algo salio mal: [ERROR] ${error}`}
    }
  }
  async getLast(a){
   const informs = await db.collection('informes').doc(`informesPf${a}`).get()

    if(informs.exists){
      return { success:true, data:informs.data().informes.length}
    }else{
      // this.increaseCounter(a)
      return {success:true, data:0}
    }

  }
  async increaseCounter(a){
    const contadorRef = db.collection('contadores').doc(`informes${a}`)

    await db.runTransaction(async(transaction)=>{
      const doc = await transaction.get(contadorRef)

      if(!doc.exists){
        transaction.set(contadorRef,{count:0})
      }else{
        const newCount = doc.data().count + 1
        transaction.update(contadorRef,{count:newCount})
      }

    })
  }
  async decreaseCounter(a){
    const contadorRef = db.collection('contadores').doc(`informes${a}`)

    await db.runTransaction(async(transaction)=>{
      const doc = await transaction.get(contadorRef)

      if(doc.exists){
        const newCount = doc.data().count -1
        transaction.update(contadorRef,{count:newCount})
      }
    })

  }
  async addFiles(a, files) {
      const informes = await db.collection(`informes`).doc(`informesPf${a}`).get();
      const docs = informes.data().informes;

      try {
          for (const file of files) {
              docs.forEach((doc, index) => {


                  // Comparación de nombres decodificados y normalizados
                  if (doc.nombre_pdf.split('_')[0] === file.originalname.split('_')[0]) {
                      console.log(true);
                      docs[index]['isPdf'] = true;
                  }
              });
          }

          console.log('-------Can----------');
          console.log(docs);

          // Actualizar los informes con los cambios en la base de datos
          await db.collection(`informes`).doc(`informesPf${a}`).update({ informes: docs });
      } catch (error) {
          console.log('No existe');
      }
  }

  async editInform(a,num){
    const getInforms = await db.collection('informes').doc(`informesPf${a}`).get()
    if(!getInforms.exists){
      return
    }
    const informs = getInforms.data().informes
    const indexInform = informs.findIndex(item => item.num_informe === num)

    return { ...informs[indexInform]}
  }
  async updateInform(a,num,newData){
    const getInforms = await db.collection('informes').doc(`informesPf${a}`).get()
    if(!getInforms.exists){
      return
    }
    const informs = getInforms.data().informes
    const indexInform = informs.findIndex(item => item.num_informe === num)
    informs[indexInform] = newData

    await db.collection('informes').doc(`informesPf${a}`).update({
      informes:informs
    })
    return { success:true }
  }






}

module.exports = Services
