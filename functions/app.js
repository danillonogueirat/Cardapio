const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaCadastroConta = require('./routes/cadastroConta');
//const rotaPedidos = require('./routes/pedidos');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header(
        'Acess-Control-Allow-Header', 
        'Origen, X-Requested-With, Content-Type', 'Accept', 'Authorization'
        );

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods','PUT , POST , PATCH, DELETE, GET' );
            return res.status(200).send({});
        }
        next();
});

app.use('/cadastroConta', rotaCadastroConta);
//app.use('/pedidos', rotaPedidos);


//quando nao encontra rota
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.mensagem
        }
    });
});

module.exports = app;