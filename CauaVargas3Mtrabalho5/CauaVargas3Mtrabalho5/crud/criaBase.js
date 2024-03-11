var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
}); 
con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!");
    var sql = "CREATE DATABASE node" //variavel q cria a base\\

    con.query(sql, function (err, result) { //o query é usado para realizar consultas no banco de dados\\
        if (err) throw err;
        console.log("Base de dados criada");
    });
    con.end();
});