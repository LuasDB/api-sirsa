const express = require('express');
const router = express.Router();
const Reports = require("../services/reports.service.js");

const reports = new Reports()


router.get('/:year/:id',async(req,res)=>{
  const { year,id } = req.params

    const get = await reports.getAll(year,id)
    res.status(get.status).json(get)

})



module.exports = router
