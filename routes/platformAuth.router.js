const express = require('express');
//Metodo router de exp
const router = express.Router()
const multer = require('multer');
require('dotenv').config();

//Se crea una instancia de multer para cuando no se reciben archivos
const uploadNone = multer();

const AuthCustomer = require('./../services/platformAuth.service')
const auth = new AuthCustomer();


router.post('/login',uploadNone.none(),async(req,res)=>{
  console.log(req.body)
 try {
  const login = await auth.login(req.body)
  res.status(201).json(login)

 } catch (error) {
  res.status(500).json({success:false,message:'Algo salio mal',error})
 }

})

router.post('/register',uploadNone.none(),async(req,res)=>{
  console.log('[PASO 0]',req.body)


  try {
    const register = await auth.create(req.body);
    res.status(register.status).json(register)

  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.get('/users',async(req,res)=>{
  try {
    const users = await auth.getAll();
    res.status(users.status).json(users)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.get('/users/:id',async(req,res)=>{
  const { id } = req.params
  try {
    const users = await auth.getOne(id);
    res.status(users.status).json(users)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.patch('/users/:id',uploadNone.none(),async(req,res)=>{
  const { id } = req.params

  try {
    const user = await auth.updateOne(id,req.body);
    res.status(user.status).json(user)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.post('/reset-password',uploadNone.none(), async (req, res) => {

  try {
    const resetPass = await auth.resetPassword(req.body)
    res.status(resetPass.status).json(resetPass);
  } catch (error) {
    res.status(resetPass.status).json({success:false, message:error});
  }
});

module.exports = router
