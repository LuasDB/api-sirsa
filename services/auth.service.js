// const { db,admin } = require('../db/firebase')
const { database,client } = require('./../db/mongodb')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Boom = require('@hapi/boom')
require('dotenv').config();

const { restablecerPass } = require('./../machotes/restablecerPass')
const { connectStorageEmulator } = require('firebase/storage')
const  ordenarPor  = require('../functions/order')


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
const { ObjectId } = require('mongodb')




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
    try{
      const { correo, password } = data
      if(!correo || !password){
        throw Boom.badData('Todos los datos son necesarios')
      }
      const user =await database.collection('usuarios').findOne({correo:correo})

      if (user) {
        throw Boom.conflict(`El usuario con correo ${correo} ya existe`)
      }

      data['password'] = await bcrypt.hash(password, 10)

      const result = await database.collection('usuarios').insertOne(data)
      return { id: result.insertedId,correo }


    }catch(error){
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al registrar usuario',error)
    }
  }

  async login(data) {
    try {
      const { correo, password } = data;
      console.log('Intento de acceso:',correo,':',password)
      const user = await this.getUser(correo);

      if (!user) {
        throw Boom.unauthorized('Email o passwor incorrectos')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw Boom.unauthorized('Email o passwor incorrectos')
      }

      const payload = { _id:user._id,nombre:user.nombre}

      const token = jwt.sign(payload, this.SECRET_KEY, { expiresIn: '4h' });

      return token
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al registrar usuario',error)
    }
  }

  async getUser(correo) {
    try {

      return await database.collection('usuarios').findOne({ correo });
    } catch (error) {
      console.error('Error en getUser:', error);
      throw error;
    }
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('[PASO 2]',decoded)


    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[PASO 3]',hashedPassword)

     const update = await database.collection('usuarios').updateOne(
      {_id:ObjectId(userId)},
      { $set:{
        password:hashedPassword
      }}
      )

    console.log(update)
    return { success:true, status:200, message:'Contraseña actualizada'}


    } catch (error) {
      return { success:false, status:500, message:'Algo salio mal'}

    }
  }





}

module.exports = Auth
