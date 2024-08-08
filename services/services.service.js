const { experimentalSetDeliveryMetricsExportedToBigQueryEnabled } = require('firebase/messaging/sw');
const { db,admin } = require('../db/firebase');
const { connectStorageEmulator } = require('firebase/storage');

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
    // data['frotis']=JSON.parse(data.frotis)

    // data['frotis'] = data.frotis.map((item)=>({
    //   ...item,
    //   id:generateUID(15)
    // }))
    try {

      const fetch = await db.collection(`${this.collection}${data.ano}`).add(data)
      if(fetch.id) return {success:true, data: fetch, message:'Creado'}

    } catch (error) {
      return {success:false, message:`Algo salio mal. [ERROR]: ${error}`}
    }




  }
  async getAllYear(year){
    try {
      const fetch = await db.collection(`${this.collection}${year}`).where('status','==','ACTIVO').get();
      const services = fetch.docs.map(item=>({id:item.id,...item.data()}))
      return {success:true, data:services}
    } catch (error) {
      return { success:false, message:`Algo salio mal: [ERROR] ${error}`}
    }
  }
  async getOne(id,a){
    try {
      const response = await db.collection(this.collection + a ).doc(id).get()
      return { success:true, data:response.data()}

    } catch (error) {
      return { success:false, message:'No se encontro'}
    }



  }
  async updateOne(id,newData){

    try {
     await db.collection(this.collection + newData.ano).doc(id).update(newData)
     return { success:true, message:'Actualizado'}

    } catch (error) {
      return {success: false, message:'Algo salio mal al actualizar'}
    }

  }
  async deleteOne(id){

  }

  async getFrotis(a){
    console.log(a)

    try {

      const services = await this.getAllYear(a)


      const allFrotis = services.data.flatMap(item =>
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
      const data = await this.getAllYear(a);

      data.data.map(record => {
        record.frotis = record.frotis.map(frotis => {
          if (frotis.id === idFrotis) {

            return { ...frotis, status: 'Recibido' };
          }
          return frotis;
        });
        if(record.frotis.some(item=>item.status === 'Registro')){
          console.log('HAY UNO')
        }else{
          record['status']='En curso'
        }
        this.updateOne(record.id,record)
      });

      return { success:true,message:'Actualizado'}
    } catch (error) {
      return { success:false, message: ' No se registro' + error}
    }
  }

  async getFrotisList(a){

    const res = await db.collection(this.collection + a).where('status','==','En curso').get()
    const listado = res.docs.map(item => ({id:item.id,...item.data()}))

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
    console.log('AÑO MODIFICACION:',a)
    const frotisRealizados= JSON.parse(body.frotisRealizados)
    const id_doc = body.id_service

    const service = await this.getOne(id_doc,a)
    const prevFrotis = service.data.frotis

    const newArrayFrotis = prevFrotis.map(item=>{
      const modifiedItem = frotisRealizados.find(modItem => modItem.id === item.id)
      return modifiedItem ? modifiedItem : item

    })

    try {
      await db.collection(this.collection + a ).doc(id_doc).update({frotis:newArrayFrotis})

    return { success:true,data:[prevFrotis,frotisRealizados,newArrayFrotis],message:'REGISTRADOS'}

    } catch (error) {
      return { success:false,message:`Algo salio mal. Error: ${error}`}
    }







  }

  async createInform(a,data){

    data.forEach(async(item)=>{
      const inform = await db.collection(`infoPF${a}`).add(item)
      if(!inform.id){
        return { success: false, message:'Algo salio mal'}
      }
    })



    return { success: true}

  }
  async getAllServicesYear(a){

    try {
      const fetch = await db.collection(`infoPF${a}`).orderBy('num_informe','desc').get();
      const services = fetch.docs.map(item=>({id:item.id,...item.data()}))
      return {success:true, data:services}
    } catch (error) {
      return { success:false, message:`Algo salio mal: [ERROR] ${error}`}
    }
  }

  async getLast(a){
    const informs = await db.collection(`infoPF${a}`).get();
    const documentCount = informs.size;

    console.log('LAST',documentCount)

    return { success:true , data:documentCount}
  }




}

module.exports = Services
