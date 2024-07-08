// Middleware para identificar errores en consola
function logErrors(err,req,res,next){
  console.log('[LOG ERROR]:');
  console.error(err);
  next(err);
}

// Middleware para enviar al cliente
function errorHandle(err,req,res,next){
  console.log('[ERROR HANDLE]');
  res.status(500).json({
    message:err.message,
    stack:err.stack
  })
}

module.exports = {logErrors,errorHandle}


