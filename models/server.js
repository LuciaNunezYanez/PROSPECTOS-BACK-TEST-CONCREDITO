const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql = require('../db/mysql');

class Server {
    constructor() {
        this.app = express()
        this.port = process.env.PORT;
        mysql.conectDB();

        this.middlewares();
        this.routes();
    }

    ejecutaQuery(){
        this.connection.query('SELECT * FROM usuarios', function (error, results, fields) {
            if (error) throw error;
        });
    }

    query(){
        this.connection.query('SELECT * FROM usuarios', function (error, results, fields) {
            if (error) throw error;
        });
    }

    middlewares() {
        this.app.use(cors(),(req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Content-Type', 'application/x-www-form-urlencoded');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
            next();
        });
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        
        // Hacer publico el index.html
        this.app.use(express.static('public'));
    }

    routes() {
        this.app.use('/prospectos', require('../routes/prospectos'));
        this.app.use('/login', require('../routes/login'));
        this.app.use('/evaluacion', require('../routes/evaluacion'));
        this.app.use('/documentos', require('../routes/documentos'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto ' + this.port);
        })
    }
}

module.exports = Server;