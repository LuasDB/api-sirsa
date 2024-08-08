const { experimentalSetDeliveryMetricsExportedToBigQueryEnabled } = require('firebase/messaging/sw');
const { db,admin } = require('../db/firebase');
const { connectStorageEmulator } = require('firebase/storage');
const  ordenarPor  = require('./../functions/order')


function generateUID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uid += characters[randomIndex];
  }
  return uid;
}

class Curtomers{
  constructor(){
    this.collection='clientes'
  }

  async create(data){
    data['cambios']=[]

    const customers =await this.getAll()
    if(customers.data.some(item=>item.razon_social === data.razon_social)){
      return { success:false, message:'La razón social ya existe'}
    }
    const newCustomer = await db.collection(this.collection).add({...data})
    if(newCustomer.id){
      return { success:true, data:{id:newCustomer.id,...data}}
    }else{
      return { success:false, message:'Algo salio mal'}
    }


  }
  async getAll(){
    const fetch = await db.collection(this.collection).where('status','==','Activo').get()
    const customers = fetch.docs.map(item =>({id:item.id, ...item.data()}))
    console.log(customers)
    return { success:true, data:ordenarPor(customers,'nombre')}
  }
  async getOne(id){
    const fetch = await db.collection(this.collection).doc(id).get()
    return { success:true, data:fetch.data()}

  }
  async updateOne(id,newData){
    try{
      const getLastData = await this.getOne(id);
      const lastData = getLastData.data
      newData['cambios']=lastData.cambios
      delete lastData['cambios']
      newData.cambios.push({
        fecha:new Date(),
        last:lastData
      })

    await db.collection(this.collection).doc(id).update(newData)
    return { success:true, message:'Registro Actualizado'}



    }catch(error){
      return { success:false, message: `No se realizó la actualización. [ERROR]:${error}`}
    }
  }
  async deleteOne(id){

  }


}

module.exports = Curtomers
