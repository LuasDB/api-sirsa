const { db,admin } = require('../db/firebase')
const { connectStorageEmulator } = require('firebase/storage')
const  ordenarPor  = require('../functions/order')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();



function generateUID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uid += characters[randomIndex];
  }
  return uid;
}

class Auth{
  constructor(){
    this.collection='usuarios'
    this.SECRET_KEY = process.env.SECRETE_KEY_JWT
  }

  async create(data){
    const { correo, password } = data
    const exist =await this.getUser(correo)
    if(exist !== null){
      return { success:false, message:'ESTE USUARIO YA EXISTE',status:400}
    }else{
      data['password'] = await bcrypt.hash(password, 10);
      const newUser = await db.collection(this.collection).add(data)
      if(newUser.id){
        return {success:true, message:'Usuario creado'}
      }else{
        return { success:false, message:'Algo salio mal, no se pudo crear ',status:500}

      }
    }
  }
  async login(data){
    const { correo,  password } = data
    const user = await this.getUser(correo)

    if(user === null){
      return { success:false, message:'Usuario o contraseña incorrectos [1]', status:404}
    }
    console.log('ESTE ES EL USUARIO:',user)
    // Verificamos la contraseña
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
      return { success:false, message:'Usuario o contraseña incorrectos',status:400}
    }
    const token = jwt.sign(user,this.SECRET_KEY,{expiresIn:'1m'})

    const {password:_, ...publicUser } = user

    return { success:true, status:200, data:{token,user:publicUser}}







  }
  async getUser(correo){
    const documents =  await db.collection(this.collection).where('correo','==',correo).get()
    if(documents.empty){
      return null
    }
    if (documents.size > 1) {
      throw new Error('Se encontraron múltiples usuarios con el mismo correo'); // Lanza un error si se encuentran múltiples usuarios
    }
    const user = documents.docs.map(item=> ({id:item.id,...item.data()}))
    return  user[0]
  }
  async verifyUser(user){

    const newUser =await  this.getUser(user.correo)


    const token = jwt.sign(newUser,this.SECRET_KEY,{expiresIn:'1m'})
    const {password:_, ...publicUser } = newUser

    return { success:true, status:200, data:{token,user:publicUser}}

  }





}

module.exports = Auth
