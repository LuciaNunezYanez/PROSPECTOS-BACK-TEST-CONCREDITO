const { Router } = require('express');
const MySQL = require('../db/mysql');
const router = Router();

router.put('/:id', (req, res) => {
    const QUERY = `CALL editEvaluacion(
        ${req.body.id_prospecto_evaluacion},
        ${req.body.id_evaluador_evaluacion},
        ${MySQL.cnn.escape(req.body.estatus_evaluacion)},
        ${MySQL.cnn.escape(req.body.observaciones_evaluacion)})`;
    
    MySQL.ejecutarQueryPr(QUERY).then((response)=>{
        return res.json({
            ok: true,
            mensaje: 'Se evaluó al prospecto'
        });
    }).catch((e)=>{
        return res.status(500).json({
            ok: false,
            error: `Error ${e}`
        });
    });
})


module.exports = router;