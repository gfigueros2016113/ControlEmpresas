'use strict'

const express = require("express");
const empleadoController = require("../controladores/empleado.controller")
var md_authenticated = require("../middlewares/authenticated")
var api = express.Router();

api.post('/registrarEmpleado', md_authenticated.ensureAuth, empleadoController.registrarEmpleado);
api.put('/editarEmpleado/:empleadoID', md_authenticated.ensureAuth, empleadoController.editarEmpleado);
api.delete('/eliminarEmpleado/:empleadoID', md_authenticated.ensureAuth, empleadoController.eliminarEmpleado);
api.get('/obtenerEmpleadoID/:empleadoID', md_authenticated.ensureAuth, empleadoController.obtenerEmpleadoID);
api.get('/obtenerEmpleadoNombre/:empNombre', md_authenticated.ensureAuth, empleadoController.obtenerEmpleadoNombre);
api.get('/obtenerEmpleadoPuesto/:empPuesto', md_authenticated.ensureAuth, empleadoController.obtenerEmpleadoPuesto);
api.get('/obtenerEmpleadoDep/:empDep', md_authenticated.ensureAuth , empleadoController.obtenerEmpleadoDep);
api.get('/obtenerNoEmpleados', md_authenticated.ensureAuth , empleadoController.obtenerNoEmpleados);
module.exports = api;