'use strict'

const usuarioModel = require('../modelos/usuario.model');
const bcrypt = require("bcrypt-nodejs");
const jwt = require('../servicios/jwt');
const htmlpdf = require("html-pdf"); 
const { obtenerNoEmpleados } = require('./empleado.controller');
const empleadoModel = require('../modelos/empleado.model');

function loginUsuario (req, res)  {
    var params = req.body;
    usuarioModel.findOne({ usuario: params.usuario }, (err, encontrarUsuario) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la petición de Login' });
        if (encontrarUsuario) {
            bcrypt.compare(params.password, encontrarUsuario.password, (err, passwordCorrecta) => {
                if (passwordCorrecta) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(encontrarUsuario)
                        });
                    } else {
                        encontrarUsuario.password = undefined;
                        return res.status(200).send({ encontrarUsuario })
                    }
                    } else {
                        return res.status(404).send({ mensaje: 'El usuario no se ha encontrado' })
                  }
            })
        } else {
            return res.status(404).send({ mensaje: 'El usuario no ha podido ingresar' })
        }
    })
}


function registrarEmpresa(req, res)  {
    var user = new usuarioModel();
    var params = req.body;
  
    if(req.user.rol === 'ROL_ADMIN'){    

    if (params.usuario && params.password) {
            user.usuario = params.usuario;
            user.rol =  'ROL_EMPRESA';
            usuarioModel.find({
                $or: [{ usuario: user.usuario }]
            }).exec((err, encontrarUsuario) => {
                if (err) return res.status(500).send({ mensaje: 'Error al agregar Usuario' });
                if (encontrarUsuario && encontrarUsuario.length == 1) {
                    return res.status(500).send({ mensaje: 'Este usuario ya Existe' });
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                        user.password = passwordEncriptada;
                        user.save((err, usuarioGuardado) => {
                            if (usuarioGuardado) {
                                 res.status(300).send(usuarioGuardado)
                            } else {
                                 res.status(404).send({ mensaje: 'Este usuario no ha podido registrarse' })
                            }
                        })
                    })
                }
            })
        }
    } else {
        res.status(404).send({ mensaje: 'No tienes permiso para registrar una empresa' })
    }
}

function editarEmpresa  (req, res){
    var empresaID = req.params.empresaID;
    var usuarioID = req.params.usuarioID;
    var params = req.body;
    delete params.password;
    if (usuarioID != req.user.sub) {
        return res.status(500).send({ mensaje: 'No tienes permisos para editar empresas' });
    }
    usuarioModel.findByIdAndUpdate(empresaID, params, { new: true }, (err, actualizarEmpresa) => {
        if (er) return res.status(500).send({ mensaje: 'Error en la peticion editar Empresa' });
        if (!actualizarEmpresa) return res.status(500).send({ mensaje: 'No se ha podido actualizar esta empresa' });
        return res.status(200).send({ actualizarEmpresa });
    })
}

function eliminarEmpresa (req, res){
    var empresaID = req.params.empresaID;
    var usuarioID = req.params.usuarioID;
    if(usuarioID != req.user.sub){
        return res.status(404).send({ mensaje: 'No tienes permisos para eliminar empresas'})
    }
    usuarioModel.findByIdAndDelete(empresaID, (err, eliminarEmpresa) => {
        if(err) return res.status(404).send({ mensaje: 'Error en la pericion eliminar empresa'});
        if(!eliminarEmpresa) return res.status(404).send({ mensaje: 'No se ha podido eliminar la empresa'});
        return res.status(200).send({ mensaje: 'Empresa Eliminada'})
    })

}

function generarPdf (req, res){
    if (req.user.rol != 'ROL_EMPRESA') return res.status(404).send({ mensaje: 'No tienes permisos para obtener empleados'})
    empleadoModel.find({ userempresa: req.user.sub}).exec((err, encontrarEmpleado)=>{
        if(err) return res.status(404).send({ mensaje: 'Error en la peticion'});
        if(!encontrarEmpleado) return res.status(404).send({ mensaje: 'No se han encontrado empleados'});
        let empleadosEmpresa = [];
        encontrarEmpleado.forEach(element => {
            empleadosEmpresa.push(element)
        });

    const content = `  
        <!doctype html>
        <html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
                <link rel="preconnect" href="https://fonts.gstatic.com">
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;1,700&display=swap" rel="stylesheet">                
                <meta charset="utf-8">
            </head>
            <body style="text-align: center">
                <div style="font-family: 'Noto Sans', sans-serif;">
                <br><br>
                <h1><strong>${req.user.usuario}</strong></h1>
                <p>Los empleados de esta empresa son:</p>
                </div>
                <div class="text-center" style="font-family: 'Noto Sans', sans-serif;">
                    <table class="table table-bordered" style="width:100%; margin.left:auto">
                        <thead>
                            <tr class="text-center">
                            <th bgcolor="EFF1FF"><strong>Nombre</strong></th>
                            <th bgcolor="EFF1FF"><strong>Puesto</strong></th>
                            <th bgcolor="EFF1FF"><strong>Departamento</strong></th>
                            </tr>
                        </thead>   
                        <tbody>
                        ${empleadosEmpresa.map(datos => `
                            <tr class="text-center">
                            <td>${datos.nombre}</td>
                            <td>${datos.puesto}</td>
                            <td>${datos.departamento}</td>
                            </tr>`).join('').replace(/['"{}']+/g,'')}
                        </tbody> 
                    </table>
                </div>
            </body>
        </html>
    `;

        htmlpdf.create(content).toFile('./src/pdf/Empleados.pdf', function(err, res){
            if(err){
                console.log(err);
            } else {
                console.log(res);
            }
        });
        return res.status(200).send({mensaje: 'El Documento ha sido generado en la carpeta pdf'});
    });
}

module.exports = {
    registrarEmpresa,
    loginUsuario,
    editarEmpresa,
    eliminarEmpresa,
    generarPdf
}