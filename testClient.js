const { io } = require('socket.io-client')

//URL del servidor Socket.io a probar
const URL_SERVER = 'http://localhost:3000'
const socket = io(URL_SERVER,{
  reconnectionAttempts:5,
  timeout:5000,
  trasnsports:['websocket']
})

socket.on('connect',()=>{
  console.log(`✅ Conectado al servidor Socket.io con ID: ${socket.id}`)
  socket.emit("mensaje", { msg: "Hola servidor, soy el cliente" })
})

socket.on('response', (data) => {
  console.log("📩 Mensaje recibido del servidor:", data)
})

socket.on("connect_error", (err) => {
  console.error("❌ Error de conexión:", err.message)
})

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Desconectado del servidor:", reason)
})
