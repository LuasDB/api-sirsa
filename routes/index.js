//Se llama la variable express para el servidor
const express = require('express');
//importacion des rutas
const labRouter = require("./lab.router.js");
const servicesRouter = require("./services.router.js");
const customersRouter = require("./customers.router.js");
const authRouter = require("./auth.router.js");
const platformAuthRouter = require("./platformAuth.router.js")
const platformPfRouter = require("./platformPf.router.js")

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1',router)
    router.use('/lab',labRouter);
    router.use('/services',servicesRouter);
    router.use('/customers',customersRouter);
    router.use('/auth',authRouter);
    router.use('/platform/auth',platformAuthRouter);
    router.use('/platform/pf',platformPfRouter);





}
module.exports=routerApi;
