const { db,admin } = require('../db/firebase')
const { restablecerPass } = require('./../machotes/restablecerPass')
const { connectStorageEmulator } = require('firebase/storage')
const  ordenarPor  = require('../functions/order')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();

const nodemailer = require('nodemailer')
const transpoter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
const fs = require('fs');
const path = require('path');




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
    this.SECRET_KEY = process.env.JWT_SECRET
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


    const { email,  password } = data
    console.log('SOLICITUD DE LOGIN',data)

    const user = await this.getUser(email)

    if(user === null){
    console.log('SOLICITUD DE LOGIN fallida pór usuario null')

      return { success:false, message:'Usuario o contraseña incorrectos [1]', status:404}
    }
    console.log('ESTE ES EL USUARIO:',user)
    // Verificamos la contraseña
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
      return { success:false, message:'Usuario o contraseña incorrectos',status:400}
    }
    delete user.password
    const token = jwt.sign(user,this.SECRET_KEY,{expiresIn:'4h'})



    return { success:true, status:200, data:{token,user}}

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
    const {password, ...publicUser } = newUser

    return { success:true, status:200, data:{token,user:publicUser}}

  }
  async solPassword(data){
    try {
      console.log('ESTE ES EL CORREO:',data)
      const user = await this.getUser(data)
      if(user === null){
        return {success:false, message:'Usuario no encontrado'}
      }
      const resetToken = jwt.sign({userId:user.id,correo:user.correo},process.env.JWT_SECRET,{expiresIn:'1h'})

      const htmlTemplate = restablecerPass(resetToken,process.env.URL_APP)


      const mailOptions = {
        from: 'saul.delaguenteb@gmail.com',
        to: data,
        subject: 'Solicitud de cambio de contraseña',
        html: htmlTemplate, // Cuerpo del correo en formato HTML
      };
      const response = await transpoter.sendMail(mailOptions, (error, info) => {
        console.log('Enviando correo...');
        if (error) {
          console.error('Error al enviar el correo:', error);
        } else {

          console.log('Correo enviado:', info.response);

        }
      });

      return { response,data,token:resetToken, success:true,message:'Se te ha enviado un correo con las instrucciones para restablecer tu contraseña'}




    } catch (error) {
      return {success:false, err}
    }
  }
  async resetPassword(data){
    const {token, newPassword} = data
    console.log('[PASO 1]',data)

    try {
       // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('[PASO 2]',decoded)


    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[PASO 3]',hashedPassword)

     const update = await db.collection(this.collection).doc(userId).update({password:hashedPassword})

    console.log(update)
    return { success:true, status:200, message:'Contraseña actualizada'}


    } catch (error) {
      return { success:false, status:500, message:'Algo salio mal'}

    }
  }





}

module.exports = Auth
