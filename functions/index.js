//const functions = require("firebase-functions");
const express = require("express");
const router = express.Router();
const pool = require("./postgres");
const { format, parseISO } = require("date-fns");
const firebase = require('./config/firebase')
const app = require('./config/express')

const authenticate = require('./middlewares/authenticate')

app.use(authenticate)

const ping = require('./api/ping')
app.get('/ping',authenticate, ping)

const rotaCadastroConta = require('./routes/cadastroConta');
app.use('/cadastroConta', rotaCadastroConta);

const oauth2 = require('./routes/oauth2');
app.post('/oauth2', oauth2.oauth2);

// Cria endpoint com a aplicação express
exports.routes = firebase.functions
  .region('southamerica-east1')
  .https.onRequest(app)


  exports.api = firebase.functions
  .region('southamerica-east1')
  .https.onRequest(app)