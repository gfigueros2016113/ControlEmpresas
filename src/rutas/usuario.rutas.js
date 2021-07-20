'use strict'

const express = require("express");
const usuarioController = require("../controladores/usuario.controller")
const md_authenticated = require("../middlewares/authenticated")
var api = express.Router();

api.post('/registrarEmpresa', md_authenticated.ensureAuth, usuarioController.registrarEmpresa);
api.post('/loginUsuario', usuarioController.loginUsuario);
api.put('/editarEmpresa/:usuarioID/:empresaID', md_authenticated.ensureAuth,usuarioController.editarEmpresa)
api.delete('/eliminarEmpresa/:usuarioID/:empresaID', md_authenticated.ensureAuth, usuarioController.eliminarEmpresa);

//Se tarda en cargar pero si se genera
api.get('/generarPdf', md_authenticated.ensureAuth,usuarioController.generarPdf);

module.exports = api;