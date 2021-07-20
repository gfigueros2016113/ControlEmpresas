'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secretKey';

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ mensaje: 'la peticion no tiene la cabecera de Autorización' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                mensaje: 'El token ha expirado'
            });
        }
    } catch (error) {
        return res.status(404).send({
            mensaje: 'El token no es válido'
        });
    }

    req.user = payload;
    next();
}