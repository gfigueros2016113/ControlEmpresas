'use strict'

const empleadoModel = require('../modelos/empleado.model');
const bcrypt = require("bcrypt-nodejs");
const jwt = require('../servicios/jwt');

function registrarEmpleado(req, res)  {
    var emp = new empleadoModel();
    var params = req.body;

    if(req.user.rol === 'ROL_EMPRESA'){

        if (params.nombre && params.puesto && params.departamento){
            emp.nombre = params.nombre;
            emp.puesto = params.puesto;
            emp.departamento = params.departamento;
            emp.userempresa = req.user.sub;

            empleadoModel.find({
                $or: [{ nombre: emp.nombre }]
            }).exec((err, encontrarEmpleado) => {
                if (err) return res.status(500).send({ mensaje: 'Error al agregar Empleado' });
                if (encontrarEmpleado && encontrarEmpleado.length == 1) {
                    return res.status(500).send({ mensaje: 'Este empleado ya existe' });
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                        emp.password = passwordEncriptada;
                        emp.save((err, empleadoGuardado) => {
                            if (empleadoGuardado) {
                                 res.status(300).send(empleadoGuardado)
                            } else {
                                 res.status(404).send({ mensaje: 'Este empleado no ha podido registrarse' })
                            }
                        })
                    })
                }
            })
        }
    }else{
        return res.status(500).send({mensaje:'No tienes permisos para registrar empleados'})
    }
} 


function editarEmpleado  (req, res){
    var empleadoID = req.params.empleadoID;
    var params = req.body;
    empleadoModel.findById(empleadoID, (err, editarEmpleado)=>{
        if(err) return res.status(404).send({mensaje: 'Error en la peticion editar'})
        if(editarEmpleado){
            if(editarEmpleado.userempresa == req.user.sub){
                empleadoModel.updateOne(editarEmpleado, params, { new: true}, (err, actualizarEmpleado)=>{
                    if(err) return res.status(404).send({  mensaje: 'Error al editar'});
                    if(!actualizarEmpleado) return res.status(404).send({ mensaje: 'No se ha podido editar'});
                    return res.status(200).send({ mensaje: 'Empleado actualizado'})
                })
            } else {
                return res.status(404).send({ mensaje: 'No tienes permisos para editar empleados'})
            }
        }
    })
}

function eliminarEmpleado (req,res){
    var empleadoID = req.params.empleadoID;
    empleadoModel.findById(empleadoID, (err, eliminarEmpleado)=>{
        if(eliminarEmpleado){
            if(eliminarEmpleado.userempresa == req.user.sub){
                empleadoModel.deleteOne(eliminarEmpleado, (err) =>{
                    if(err) return res.status(404).sen({ mensaje: 'Error en la peticion eliminar'});
                    return res.status(200).send({ mensaje: 'Empleado eliminado' });
                })
            } else {
                return res.status(404).send({ mensaje: 'No tienes permisos para eliminar empleados'})
            }
        } else {
            return res.status(404).send({ mensaje: 'Empleado no encontrado'})
        }
    })
}

function obtenerEmpleadoID (req, res) {
    var empleadoID = req.params.empleadoID;
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados' })
    empleadoModel.findById(empleadoID, (err, encontrarEmpleado) => {
        if (err) return res.status(404).send({ mensaje: 'Error en la peticion' });
        if (!encontrarEmpleado) return res.status(404).send({ mensaje: 'Este empleado no existe' });
        if (req.user.sub != encontrarEmpleado.userempresa) return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados' });
        return res.status(200).send({ encontrarEmpleado });
    })
}

function obtenerEmpleadoNombre (req, res){
    var empNombre = req.params.empNombre;
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados' })
    empleadoModel.find({nombre: empNombre, userempresa: req.user.sub}, (err, encontrarEmpleado) => {
        if (err) return res.status(404).send({ mensaje: 'Error en la peticion' });
        if (!encontrarEmpleado) return res.status(404).send({ mensaje: 'Este empleado no existe' });
        return res.status(200).send({ encontrarEmpleado });
    })
}

function obtenerEmpleadoPuesto (req, res){
    var empPuesto = req.params.empPuesto;
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados' })
    empleadoModel.find({puesto: empPuesto, userempresa: req.user.sub}, (err, encontrarEmpleado) => {
        if (err) return res.status(404).send({ mensaje: 'Error en la peticion' });
        if (!encontrarEmpleado) return res.status(404).send({ mensaje: 'Este empleado no existe' });
        return res.status(200).send({ encontrarEmpleado });
    })
}

function obtenerEmpleadoDep (req, res){
    var empDep = req.params.empDep;
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados' })
    empleadoModel.find({departamento: empDep, userempresa: req.user.sub}, (err, encontrarEmpleado) => {
        if (err) return res.status(404).send({ mensaje: 'Error en la peticion' });
        if (!encontrarEmpleado) return res.status(404).send({ mensaje: 'Este empleado no existe' });
        return res.status(200).send({ encontrarEmpleado });
    })
}

function obtenerNoEmpleados (req, res){
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados'})
    empleadoModel.find({ userempresa: req.user.sub}).exec((err, encontrarEmpleado)=>{
        if(err) return res.status(404).send({ mensaje: 'Error en la peticion'});
        if(!encontrarEmpleado) return res.status(404).send({ mensaje: 'No se han encontrado empleados'});
        return res.status(200).send({encontrarEmpleado, NoEmpleadosExistentes: encontrarEmpleado.length});
    })
}

module.exports = {
    registrarEmpleado,
    editarEmpleado,
    eliminarEmpleado,
    obtenerEmpleadoID,
    obtenerEmpleadoNombre,
    obtenerEmpleadoPuesto,
    obtenerEmpleadoDep,
    obtenerNoEmpleados
}