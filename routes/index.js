//Se llama la variable express para el servidor
const express = require('express');
//importacion des rutas
const labRouter = require("./lab.router.js");
const servicesRouter = require("./services.router.js");
const customersRouter = require("./customers.router.js");

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1',router)
    router.use('/lab',labRouter);
    router.use('/services',servicesRouter);
    router.use('/customers',customersRouter);

}
module.exports=routerApi;
