//importacion de la base de firestore
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
//definicion de la clase con varios objetos
class Laboratory {
  constructor(){
    this.collection='laboratorioPf'
  }

/*****************************************************************************************************************
 * SUPER IMPORTANTE
 *Cada metodo de nuestra clase User devolvera algo para indicar si se llevo a cabo o no la logica de nogocio
 *
 * Para estandarizar usaremos las siguientes variables, que siempre seran las mismas cuando aplique:
 * success: true o false --> esta variable indicara si se realizo correctamentye la acción
 * message: 'Mensaje que indique algo importante'
 * data: objeto --> cuando se trate de datos que se deben retornar se enviartan en esta variable
 *
 *
******************************************************************************************************************/



  async create(data){

    const toAdd = JSON.parse(data.data)
    toAdd['id']= generateUID(15)

    const document = data.document
    const getDocument = await db.collection(this.collection).doc(document).get()
    const lista = getDocument.data().lista
    lista.push(toAdd);
    await db.collection(this.collection).doc(document).update({
      lista: lista
    });



    return { success:true , message:'Nuevo registro creado'}
  }
  async getAll(){
    const getUsers = await db.collection(this.collection).get();
    const users = getUsers.docs.map(item => ({id:item.id,...item.data()}))
    return {
      success:true,
      data: users
    }
  }
  async getOne(id){
    const getUser = await db.collection(this.collection).doc(id).get();

    if(!getUser.exists){
      return { success:false,message:'No encontrado'}
    }
    return {
      success:true,
      data:getUser.data()
    }


  }
  async updateOne(document,newData){
    console.log(document)
    console.log(newData)

    const getDocument = await db.collection(this.collection).doc(document).get()


    const lista = getDocument.data().lista
    console.log('[liasta]',lista)

    const index = lista.findIndex(item => item.id === newData.id)
    console.log(index)
    lista[index]=newData

    const update = await db.collection(this.collection).doc(document).update({
      lista: lista
    });
    console.log(update)
    return { success:true, message:'Actualizado',data:update}
  }
  async deleteOne(id){
     await this.updateOne(id,{status:'Baja'})
     return { success:true, message:'Eliminado'}
  }
  async getOneElement(doc,id){
    const lista = await this.getOne(doc)
    const element = lista.data.lista.find(item=> item.id === id)

    if(element){
      return {
        success:true, data:element,message:'Encontrado'
      }
    }else{
      return {
        success:false, message:'Elemento no encontrado'
      }
    }



  }

}

module.exports = Laboratory;
