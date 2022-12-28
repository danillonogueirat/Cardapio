require("dotenv/config");
const authenticate = (req, res, next) => {

 console.log(process.env.TOKEN);
  if (!req.headers.authorization) {
    //console.log('Negado: Authorization Header n�o encontrado')
    return res.status(403).send('Unauthorized')
    // Valida toke recebido
  } else if (
    req.headers.authorization !== process.env.TOKEN
  ) {
    //console.log('Negado: Authorization Header inv�lido')
    return res.status(403).json({ error: true, msg: 'Unauthorized' })
    // Aprova acesso
  } else {
    return next()
  }
}

module.exports = authenticate