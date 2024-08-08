const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

  console.log('ENTRANDO A MIDLEWARE')
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log(token)

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token,process.env.SECRETE_KEY_JWT)
    req.user = decoded
    next()

  } catch (error) {
    res.status(401).json({success:false, message:'Token invalido'})
  }


}

module.exports = authenticateToken
