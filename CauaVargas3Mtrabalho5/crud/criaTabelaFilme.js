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
    var sql2 = "CREATE TABLE filme (id INT AUTO_INCREMENT PRIMARY KEY, nomeFilme VARCHAR(255), diretor VARCHAR(255), ano VARCHAR(255),imagem VARCHAR(255))";
    //variavel cria a tabela e informa as colunas\\
    con.query(sql2, function (err, result) {
        if (err) throw err;
        console.log("Tabela criada");
    });
    con.end();
});