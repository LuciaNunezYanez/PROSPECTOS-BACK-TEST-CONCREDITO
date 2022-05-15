
var mysql = require('mysql');

class MySQL {

    cnn;
    _instance;

    constructor() { }


    static conectDB() {
        // HEROKU
        this.cnn = mysql.createConnection({
            host: 'uyu7j8yohcwo35j3.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            port: 3306,
            user: 'sgxj3wjaila2yt0j',
            password: 'wc6j5r40hircj1m8',
            database: 'ceze99k0rcuxzstf'
        });
        // LOCALHOST
        // this.cnn = mysql.createConnection({
        //     host: '127.0.0.1',
        //     port: 3306,
        //     user: 'root',
        //     password: 'M7750la?',
        //     database: 'concredito'
        // });
        this.cnn.connect();
    }

    get instance() {
        return this._instance || (this._instance = new this());
    }
    
    static query() {
        this.cnn.query('SELECT * FROM usuarios', function (error, results, fields) {
            if (error) throw error;
        });
    }

    static ejecutarQueryPr(query) {
        return new Promise((resolve, reject) => {
            this.cnn.query(query, (err, results, fields) => {
                if (err) {
                    console.log('======== Error al ejecutar query (promesa) ========');
                    return reject(err)
                }
                if (results?.length === 0) {
                    resolve('El registro solicitado no existe');
                } else {
                    resolve(results);
                }
            });

        });
    }
}

module.exports = MySQL;