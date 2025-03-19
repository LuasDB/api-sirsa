const express = require('express');
const { logErrors, errorHandle } = require('./middleware/error.handler')
const routerAPI = require("./routes/index")
const cors = require('cors')
const {createServer} = require('http')
const { Server } = require('socket.io')
const { client } = require('./db/mongodb.js')


const port =process.env.PORT || 3000;
//Express

const app = express();
app.use(express.json())
app.use(cors({
  origin: 'https://pf.siradiacion.com.mx',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
const httpServer = createServer(app)

//Socket.io
// const io = new Server(httpServer,{
//   cors:{
//     origin:`${process.env.URL_FRONTEND || '*'}`,
//     methods:['GET','POST']
//   }
// })

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

io.on('connection',(socket)=>{
  console.log('Nuevo Usuario conectado:',socket.id)

  socket.on('disconnect',()=>{
    console.log('Usuario desconectado:', socket.id)
  })
  //aqui colocaremos los demas mensajes:
  socket.on('mensaje', (msg) => {
    console.log('Mensaje recibido:', msg)
    socket.emit('response', `Bienvenido usuario ${socket.id}`)
  });


})

//Funcion para Iniciar el servidor
const startServer = async()=>{
  try {
    await client.connect()
    console.log('✅ Conectado a MongoDB')
    //Rutas
    routerAPI(app,io);
    app.use(logErrors);
    app.use(errorHandle);
    app.use('/uploads',express.static("uploads"));

    httpServer.listen(port,()=>{
      console.log(`✅ Servidor iniciado en el puerto : ${port}`)
    })




  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error)
    process.exit(1)
  }
}

process.on('SIGINT',async()=>{
  await client.close()
  console.log('🛑 Conexión con MongoDB cerrada')
  process.exit(0)
})

startServer()


