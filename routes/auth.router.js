const express = require('express');
const router = express.Router();
const Auth = require("../services/auth.service.js");
const multer = require('multer');
const uploadNone = multer();
const authenticateToken = require('./../middleware/authenticateToken.js');
const { verify } = require('jsonwebtoken');
const auth  = new Auth();

router.post('/register',uploadNone.none(),async(req,res,next)=>{
    const user = await auth.create(req.body)
    if(user.success){
      res.status(201).json(user)
    }else {
      res.status(user.status).json(user)
    }
})
router.post('/login',uploadNone.none(),async(req,res,next)=>{
    const user = await auth.login(req.body)
    if(user.success){
      res.status(201).json(user)
    }else {
      res.status(user.status).json(user)
    }
})
router.post('/sol-password',uploadNone.none(),async(req,res,next)=>{
  const { email } = req.body
  const user = await auth.solPassword(email)
  if(user.success){
    res.status(201).json(user)
  }else {
    res.status(500).json(user)
  }
})

router.post('/reset-password',uploadNone.none(), async (req, res) => {
  try {
    const resetPass = await auth.resetPassword(req.body)
    res.status(resetPass.status).json(resetPass);
  } catch (error) {
    res.status(500).json({success:false, message:error});
  }
});


router.get('/verify',authenticateToken,async(req,res)=>{
  const user = await auth.verifyUser(req.user)
    res.status(user.status).json(user)
})

module.exports = router
