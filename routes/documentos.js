const { Router } = require('express');
const MySQL = require('../db/mysql');
const router = Router();

var multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const { LONG } = require('mysql/lib/protocol/constants/types');


// Responde con el archivo, necesita el ID para buscar la ruta
router.get('/file/download/file/:id', (req, res) => {
    var QUERY = `SELECT ruta_documento FROM documentos WHERE id_documento = ${req.params.id};`
    var ruta_documento;

    MySQL.ejecutarQueryPr(QUERY).then((response) => {
        // Comprobar que se tiene un ruta
        if (!response[0].ruta_documento){
            return res.json({ ok: false, mensaje: response });
        }
        ruta_documento = response[0].ruta_documento;
        let pathImg = path.resolve(__dirname, `../${ruta_documento}`);

        // Comprobar que exista la ruta en el servidor
        if (!fs.existsSync(pathImg)) {
            return res.json({ ok: false, mensaje: 'No se encontró  la ruta del archivo' });
        }

        // Generar un nombre aleatorio para el archivo
        var nombre_archivo = Math.floor(Date.now() / 1000) + '.' + pathImg.split('.').pop();
        // Enviar archivo
        return res.download(pathImg, nombre_archivo);
    }).catch((e) => {
        // No se encontró el documento en la DB.
        console.log(e);
        return res.status(500).json({
            ok: false,
            error: e
        });
    });

});

router.get('/file/download/url/:id', (req, res) => {
    var QUERY = `SELECT ruta_documento FROM documentos WHERE id_documento = ${req.params.id};`
    var ruta_documento;

    MySQL.ejecutarQueryPr(QUERY).then((response) => {
        // Comprobar que se tiene un ruta
        if (!response[0].ruta_documento){
            return res.json({ ok: false, mensaje: response });
        }
        ruta_documento = response[0].ruta_documento;

        // Comprobar que exista la ruta en el servidor
        if (!fs.existsSync(ruta_documento)) {
            console.log('No se encontró la ruta: ' + ruta_documento);
            return res.json({ ok: false, mensaje: 'No se encontró  la ruta del archivo' });
        }

        // Generar un nombre aleatorio para el archivo
        var nombre_archivo = Math.floor(Date.now() / 1000) + '.' + ruta_documento.split('.').pop();
        // Enviar url para descarga
        return res.json({
            ok: true, 
            file: {
                nombre: nombre_archivo,
                url: ruta_documento,
                extension: ruta_documento.split('.').pop()
            }
        });
    }).catch((e) => {
        // No se encontró el documento en la DB.
        console.log(e);
        return res.status(500).json({
            ok: false,
            error: e
        });
    });

});

router.get('/prosp/:id', (req, res) => {
    const QUERY = `CALL getDocumentsProsp(${req.params.id})`;

    MySQL.ejecutarQueryPr(QUERY).then((response) => {
        return res.json({
            ok: true,
            data: response[0]
        });
    }).catch((e) => {
        console.log(e);
        return res.status(500).json({
            ok: false,
            e
        });
    });
})

router.get('/unique/:id', (req, res) => {
    const QUERY = `SELECT * FROM documentos WHERE id_documento = ${req.params.id};`;

    MySQL.ejecutarQueryPr(QUERY).then((response) => {
        return res.json({
            ok: true,
            documento: response[0]
        });
    }).catch((e) => {
        console.log(e);
        return res.status(500).json({
            ok: false,
            e
        });
    });
})

// Recibe varios documentos - MultiPart
router.post('/add/:id', (req, res) => {
    var id_prospecto = req.params.id;
    var pathRelativo = './multimedia/prospectos/';
    var form = new multiparty.Form({ uploadDir: pathRelativo});
    var nombreDocumentos = Object.values(req.query);
    // console.log(fs.existsSync(pathRelativo));
    // Comienza el código para guardar el documento en el servidor
    form.on('error', function (err) {
        console.log('Error al parsear formulario : ' + err.stack);
    });
    form.on('part', function (part) {
        part.on('error', function (err) {
            console.log('Error al obtener parte ' + err);
        });
    });
    // Guardar el documento
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log('Ocurrió un error al parsear formulario: ' + err);
        } else {
            // Obtener los nombres y guardarlos en la base de datos
            if (files.archivos) {
                for (let i = 0; i < files.archivos.length; i++) {
                    var rutaGenerada = files.archivos[i].path;
                    var descripcionDocumento = nombreDocumentos[i];

                    // Agregar cada archivo a la base de datos
                    var QUERY = `CALL addDocument(${id_prospecto}, ${MySQL.cnn.escape(descripcionDocumento)}, ${MySQL.cnn.escape(rutaGenerada)});`
                    MySQL.ejecutarQueryPr(QUERY).then((result) => {
                        if (i === (files.archivos.length - 1)) {
                            // console.log("SE AÑADIERON LOS DOCUMENTOS... ");
                            return res.json({ ok: true });
                        }
                    }).catch(() => {
                        console.log('Error al agregar documento');
                        return res.json({ ok: false });
                    });
                }
            }
        }
    });
});


module.exports = router;