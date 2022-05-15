const { Router } = require('express');
const MySQL = require('../db/mysql');
const router = Router();

router.post('/', (req, res) => {
    const QUERY = `CALL getLogin(${MySQL.cnn.escape(req.body.usuario)},${MySQL.cnn.escape(req.body.contrasena)})`;
    
    MySQL.ejecutarQueryPr(QUERY).then((response)=>{
        return res.json({
            ok: true,
            usuario: response[0][0]
        });
    }).catch((e)=>{
        console.log(e);
        return res.status(500).json({
            ok: false,
            e
        });
    });
})


module.exports = router;