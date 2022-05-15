const { Router } = require('express');
const { resolve } = require('path');
const MySQL = require('../db/mysql');
const router = Router();

router.get('/unique/:id', (req, res) => {
    prospecto = {};
    direccion = {};
    evaluacion = {};
    documentos = [];

    misPromesas = [];
    misPromesas.push(traerProspecto(req.params.id));
    misPromesas.push(traerDireccion(req.params.id));
    misPromesas.push(traerDocumentos(req.params.id));
    misPromesas.push(traerEvaluacion(req.params.id));

    // Encadenar promesas
    Promise.all(misPromesas).then((results)=>{
        prospecto = results[0];
        direccion = results[1];
        documentos = results[2];
        evaluacion = results[3];
        
        return res.json({
            prospecto: prospecto,
            direccion: direccion,
            evaluacion: evaluacion,
            documentos: documentos
        });

    }).catch((e)=>{
        console.log('error: ' + e);
    });

    
});

function traerProspecto(id){
    return new Promise((resolve, reject) =>{
        MySQL.ejecutarQueryPr(`SELECT * FROM prospectos WHERE id_prospecto = ${id} LIMIT 1;`).then((response) => {
            resolve(response[0])
        }).catch((e) => {
            reject({msg: 'No existe'});
        });
    });
}
function traerDireccion(id){
    return new Promise((resolve, reject) =>{
        MySQL.ejecutarQueryPr(`CALL getDireccionProsp(${id});`).then((response) => {
            resolve(response[0][0])
        }).catch((e) => {
            reject({msg: 'No existe'});
        });
    });
}
function traerEvaluacion(id){
    return new Promise((resolve, reject) =>{
        MySQL.ejecutarQueryPr(`SELECT * FROM evaluacion WHERE id_prospecto_evaluacion = ${id} LIMIT 1;`).then((response) => {
            resolve(response[0])
        }).catch((e) => {
            reject({msg: 'No existe'});
        });
    });
}
function traerDocumentos(id){
    return new Promise((resolve, reject)=>{
        MySQL.ejecutarQueryPr(`call getDocumentsProsp(${id});`).then((response) => {
            resolve(response[0])
        }).catch((e) => {
            reject({msg: 'No existe'});
        });
    });
}


router.get('/mios/:id', (req, res) => {
    MySQL.ejecutarQueryPr(`CALL getMisProspectos(${req.params.id})`).then((response) => {

        prospecto = [];
        evaluacion = [];

        response[0].forEach(p => {
            pr = {
                id_prospecto: p.id_prospecto,
                nombre_prospecto: p.nombre_prospecto,
                apellido_p_prospecto: p.apellido_p_prospecto,
                apellido_m_prospecto: p.apellido_m_prospecto,
                telefono_prospecto: p.telefono_prospecto,
                rfc_prospecto: p.rfc_prospecto,
                id_direccion_prospecto: p.id_direccion_prospecto
            }
            ev = {
                id_prospecto_evaluacion: p.id_prospecto_evaluacion,
                id_promotor_evaluacion: p.id_promotor_evaluacion,
                id_evaluador_evaluacion: p.id_evaluador_evaluacion,
                fecha_registro_evaluacion: p.fecha_registro_evaluacion,
                fecha_evaluacion_evaluacion: p.fecha_evaluacion_evaluacion,
                estatus_evaluacion: p.estatus_evaluacion,
                observaciones_evaluacion: p.observaciones_evaluacion
            }

            prospecto.push(pr);
            evaluacion.push(ev);
        });

        return res.json({
            ok: true,
            prospectos: prospecto,
            evaluaciones: evaluacion
        });
    }).catch((e) => {
        console.log(e);
        return res.status(500).json({
            ok: false,
            e
        });
    });
});

// S
router.get('/:estatus', (req, res) => {
    MySQL.ejecutarQueryPr(`CALL getProspectosEvaluar(${MySQL.cnn.escape(req.params.estatus)})`).then((response) => {
        prospecto = [];
        evaluacion = [];

        response[0].forEach(p => {
            pr = {
                id_prospecto: p.id_prospecto,
                nombre_prospecto: p.nombre_prospecto,
                apellido_p_prospecto: p.apellido_p_prospecto,
                apellido_m_prospecto: p.apellido_m_prospecto,
                telefono_prospecto: p.telefono_prospecto,
                rfc_prospecto: p.rfc_prospecto,
                id_direccion_prospecto: p.id_direccion_prospecto
            }
            ev = {
                id_prospecto_evaluacion: p.id_prospecto_evaluacion,
                id_promotor_evaluacion: p.id_promotor_evaluacion,
                id_evaluador_evaluacion: p.id_evaluador_evaluacion,
                fecha_registro_evaluacion: p.fecha_registro_evaluacion,
                fecha_evaluacion_evaluacion: p.fecha_evaluacion_evaluacion,
                estatus_evaluacion: p.estatus_evaluacion,
                observaciones_evaluacion: p.observaciones_evaluacion
            }

            prospecto.push(pr);
            evaluacion.push(ev);
        });

        return res.json({
            ok: true,
            prospectos: prospecto,
            evaluaciones: evaluacion
        });
    }).catch((e) => {
        console.log(e);
        return res.status(500).json({
            ok: false,
            e
        });
    });
})


router.post('/add/', (req = Request, res = Response) => {

    const { calle, numero, colonia, cp, nombre_prospecto, apellido_p_prospecto,
        apellido_m_prospecto, telefono_prospecto, rfc_prospecto, id_usuario } = req.body;

    const QUERY = `CALL addProspecto(
        ${MySQL.cnn.escape(calle)},
        ${MySQL.cnn.escape(numero)},
        ${MySQL.cnn.escape(colonia)},
        ${cp}, 
        ${MySQL.cnn.escape(nombre_prospecto)},
        ${MySQL.cnn.escape(apellido_p_prospecto)},
        ${MySQL.cnn.escape(apellido_m_prospecto)},
        ${MySQL.cnn.escape(telefono_prospecto)},
        ${MySQL.cnn.escape(rfc_prospecto)},
        ${id_usuario});`;

    MySQL.ejecutarQueryPr(QUERY).then((response) => {
        return res.json({
            ok: true,
            prospecto: {
                id_prospecto: response[0][0].id_prospecto
            }
        });
    }).catch((e) => {
        console.log(e);
        return res.status(400).json({
            ok: false,
            e
        });
    });
})

module.exports = router;