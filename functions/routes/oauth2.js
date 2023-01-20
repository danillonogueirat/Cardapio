const pool = require("../postgres");
const bcrypt = require("bcrypt");
require("dotenv/config");



/**
 * Função que é executada por um post e retorna dados do usuario e se autenticado 
 * retorna tambem o token e hora de expiração. 
 */
const oauth2 = async (req, res) => {
  const { email, senha } = req.body;
  if (!email) {
    return res.status(400).json({mensagem: 'Senha errada'});
  } else if (!senha) {
    return res.status(400).json({mensagem: 'Senha errada'});
  }
  try {
    let response = await pool.query(
      `SELECT id, created_at, empresa, filial, nome, email, senha, ddd, telefone, delete FROM usuarios WHERE delete = false AND email = '${email.trim()}'`
      );
      console.log("Senha: ", senha);
      console.log("Senha: ", response.rows[0].senha);
    if (!response.rows[0]) {
      return res.status(401).json({mensagem: 'Vazio'});
    } else if (!bcrypt.compareSync(senha, response.rows[0].senha)) {
      return res.status(401).json({mensagem: 'Senha errada'});
    }
    console.log("Cheguei aqui!");
  } catch (e) {
    return res.status(500).json({mensagem: 'Erro' });
  }
};


module.exports = {
  oauth2
};