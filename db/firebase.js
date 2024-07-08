////Como se utilizan variables de entorno se llama dotenv para facilitar el llamado a las variables
require('dotenv').config();
//Se envia desde aqui el servidor, ya que est eva a depender si esta corriendo en local o si ya existe un dominio cuando este en produccion
const server = process.env.URL_SERVER


//** OTRO MODO PARA UTILIZAR FIREBASE */
const admin = require('firebase-admin');
// const serviceAccount = require('./paginasaul-eabef-firebase-adminsdk-3o5l4-71f2ad441d.json');
const firebaseConfig = require('./../credentialsSirsa.json')

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`

});

const db = admin.firestore();


module.exports = {db,server,admin}



