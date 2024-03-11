var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node"
});


con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!");
    var sql = "CREATE TABLE usuario (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255), senha VARCHAR(255))";

    //variavel cria a tabela e informa as colunas\\
    con.query(sql,function (err, result) {
        if (err) throw err;
        console.log("Tabela criada");
    });
    con.end();
});