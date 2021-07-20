'use strict'
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpleadosSchema = Schema({
    nombre: String,
    puesto: String,
    departamento: String,
    userempresa: { type: Schema.Types.ObjectId, ref: 'usuario'}
});

module.exports = mongoose.model ('empleados', EmpleadosSchema);