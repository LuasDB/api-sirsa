
// Middleware para identificar y registrar errores en consola
function logErrors(err, req, res, next) {
  console.error('[LOG ERROR]:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Status:', err.status || 500);
  next(err); // Pasar el error al siguiente middleware
}

// Middleware para manejar errores y enviar al cliente
function errorHandle(err, req, res, next) {
  console.error('[ERROR HANDLE]');

  // Establecer el código de estado HTTP, predeterminado a 500 si no se especifica
  const statusCode = err.status || 500;

  // Respuesta genérica para el cliente
  const response = {
    message: err.message || 'Internal Server Error',
  };

  // Incluir el stack trace solo en entornos de desarrollo para mayor seguridad
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { logErrors, errorHandle };
