const express = require('express');
const mysql = require('mysql');
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const bcrypt = require("bcrypt");
const saltRounds = 10;
var session = require('express-session');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static("public"));

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));




const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node"
});



app.get('/', function (req, res) {
    res.render('index.ejs', {dadosUsuario: req.session.username});
});

app.get('/login', function (req, res) {
    res.render('login.ejs', { mensagem: "Realize o Login" });
});

app.post('/login', function (req, res) {
    var senha = req.body['senha'];
    var email = req.body['email']
    var sql = "SELECT * FROM usuario where email = ?";
    con.query(sql, [email], function (err, result) {
        if (err) throw err;
        if (result.length) {
            bcrypt.compare(senha, result[0]['senha'], function (err, resultado) {
                if (err) throw err;
                if (resultado) {
                    req.session.logado = true;
                    req.session.username = result[0]['nome'];
                    res.redirect('/');
                }
                else { res.render('login', { mensagem: "Senha inválida" }) }
            });
        }
        else { res.render('login.ejs', { mensagem: "E-mail não encontrado" }) }
    });
});



app.get('/create', function (req, res) {
    res.render('create.ejs');

});

app.post('/create', function (req, res) {
    bcrypt.hash(req.body['senha'], saltRounds, function (err, hash) {
        var sql = "INSERT INTO usuario (nome, email, senha) VALUES ?";
        var values = [
            [req.body['nome'], req.body['email'], hash]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Numero de registros inseridos: " + result.affectedRows);
        });
    });
    res.redirect('/login');
});

app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
    
    })
    res.redirect('/');
   });

   app.get('/createFilme', function (req, res) {
    if (req.session.logado){
    res.render('createFilme.ejs');
    }
    else {
        res.render('login.ejs', {mensagem: "Por favor realize o login para acessar esta página"})
    }
});


app.post('/createFilme', function (req, res) {
    if(req.session.logado){
        var Form = new formidable.IncomingForm();
    Form.parse(req, (err, fields, files) => {
        var oldpath = files.imagem.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeIMG = hash +'.'+files.imagem.mimetype.split('/')[1];
        var newpath = path.join(__dirname, 'public/imagens/', nomeIMG);
        fs.rename(oldpath, newpath, function(err) {
            if (err) throw err;
        });
        var sql = "INSERT INTO filme (nomeFilme, diretor, ano, sinopse, imagem) VALUES ?";
        var values = [
            [fields['nomeFilme'], fields['diretor'], fields['ano'], fields['sinopse'], nomeIMG]];
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
        });
    });
    res.redirect("/show");
    }else{
        res.redirect('/login')
    }
    
});

app.get('/show', function (req, res) {
    var sql ="SELECT * FROM filme"
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.render('show.ejs', {dadosUsuario: req.session.username, dadosFilme: result})
    });
    
});

app.get ('/delete/:id', function(req,res){
    if (req.session.logado) {
    var id = req.params.id;
    var sql = "SELECT * FROM filme WHERE id=?"

    con.query(sql, id, function (err, result, fields) {
        if (err) throw err;
        const img = path.join(__dirname, 'public/imagens/', result[0]['imagem']);
        fs.unlink(img, (err) => {
        });
    });
    var sql = "DELETE FROM filme WHERE id = ?";
    con.query(sql, id, function(err, result) {
        if(err) throw err;
        console.log("Numero de registros apagados: " + result.effectedRows);
    });
    res.redirect('/show');
    }
    else {
      res.render('login.ejs', { mensagem: 'Por favor realize o login para acessar a página' });
    }
});

app.post('/edit/:id', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        var id = req.params.id;
        var sql = "SELECT * FROM filme WHERE id=?";
        var oldpath = files.imagem.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeIMG = hash +'.'+files.imagem.mimetype.split('/')[1];
        var newpath = path.join(__dirname, 'public/imagens/', nomeIMG);
        con.query(sql, id, function(err, result, fields) {
        if(err) throw err;
        fs.rename(oldpath, newpath, function(err) {
        if (err) throw err;
        });
        const img = path.join(__dirname, 'public/imagens/', result[0]['imagem']);
        fs.unlink(img, (err) => {});
        
        });
        var sql2 = "UPDATE filme SET nomeFilme = ?, diretor = ?, ano = ?, sinopse = ?, imagem = ? WHERE id = ?";
        var values2 = [
        [fields['nomeFilme']],
        [fields['diretor']],
        [fields['ano']],
        [fields['sinopse']],
        [nomeIMG],
        [id]
        ];
        con.query(sql2, values2, function (err, result) {
        if (err) throw err;
        });
        });
        res.redirect("/show");
    });

app.get('/edit/:id', function (req, res) {
    if (req.session.logado) {
    var sql = "SELECT * FROM filme where id=?";
    var id = req.params.id;
    con.query(sql, id, function (err, result, fields) {
        if (err) throw err;
        res.render('edit.ejs', { dadosFilme: result });
    });
}
else {
    res.render('login.ejs', { mensagem: 'Por favor realize o login para acessar a página' });
  }
}); 

app.get('/verFilme/:id', function (req, res) {
        var sql = "SELECT * FROM filme where id=?";
        var id = req.params.id;
        con.query(sql, id, function (err, result, fields) {
            if (err) throw err;
            res.render('verFilme.ejs', {dadosFilme: result, dadosUsuario: req.session.username});
});
});


app.listen(3000, function () {
    console.log("Servidor Escutando na porta 3000");
});