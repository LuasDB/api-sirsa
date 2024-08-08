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

router.get('/verify',authenticateToken,async(req,res)=>{
  const user = await auth.verifyUser(req.user)

    res.status(user.status).json(user)


})

module.exports = router
