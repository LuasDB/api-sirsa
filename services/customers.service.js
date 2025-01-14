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

  async create(data) {
    try {
      const getCustomer = await db.collection(this.collection).where('rfc', '==', data.rfc).get();

      if (!getCustomer.empty) {
        console.log('Cliente ya existe');
        return { exists: true };  // Retorna un objeto que indica que ya existe
      }

      await db.collection(this.collection).add(data);
      return { success: true };  // Retorna un objeto indicando que se creó correctamente
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      throw new Error('Error al crear el cliente');
    }
  }



  async getAll(){
    console.log('[PASO1]')
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
