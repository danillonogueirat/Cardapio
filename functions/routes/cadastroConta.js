const express = require("express");
const router = express.Router();
const pool = require("../postgres");
const { format } = require("date-fns");
const bcrypt = require("bcrypt");

// retorna todos os usuarios
router.get("/", (req, res, next) => {
  try {
    pool.query(
      "SELECT id, created_at, empresa, filial, nome, email, senha, ddd, telefone, delete FROM usuarios WHERE delete = false ",
      (error, resultado) => {
        if (error) {
          console.log("Erro aqui: ", error);
          throw error;
        }
        return res.status(200).json(resultado.rows);
      }
    );
  } catch (error) {
    return res.status(400).json({ error });
  }
});
//https://www.section.io/engineering-education/javascript-dates-manipulation-with-date-fns/#:~:text=Date%2Dfns%20supports%20time%20zone,pm%20PST%20on%20a%20Node.
/* let data2 = format(new Date(),'yyyy-MM-dd HH:mm:ss')
console.log("Fora: "+data2) */

// insere um novo cadastro
router.post("/", async (req, res, next) => {
  let data = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const senhaCripto = bcrypt.hashSync(req.body.senha, 10); //await CriptoSenha(req.body.senha);
  let telefoneFix = trataTelefone(req.body.telefone);
  let telefoneCelular = trataTelefone(req.body.celular);
  let dddTelefoneFixo = retornaDdd(req.body.telefone);
  let dddCelular = retornaDdd(req.body.celular);
  
  console.log("Nome: ", req.body.nome);

  if (!req.body.telefone) {
    // se não tiver telefone fixo... grava o numero do celular.
    telefoneFix = trataTelefone(req.body.celular);
    dddTelefoneFixo = retornaDdd(req.body.celular);
  }

  try {
    const insert = await pool.query(
      "INSERT INTO usuarios (empresa, filial, nome, email, senha, ddd, telefone, ddd2, celular, delete) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
      [
        req.body.empresa,
        req.body.filial,
        removeCharSpecial(req.body.nome),
        req.body.email,
        senhaCripto.trim(),
        dddTelefoneFixo,
        telefoneFix,
        dddCelular,
        telefoneCelular,
        req.body.delete,
      ]
    );

    return res.status(200).send({ mensagem: "Conta cadastrada com sucesso." });

  } catch (err) {
    return res.status(400).send(console.log(err));
  }
});

// retorna os dados do cadastro do usuario.
router.get("/:id", (req, res) => {
  const id = req.query.id;
  const filial = req.query.filial;
  const nome = req.query.nome;

  pool.query(
    "SELECT id, A.created_at, A.empresa, A.filial, A.nome, A.email, A.senha, A.ddd, A.telefone, A.delete FROM usuarios WHERE A.delete = false AND A.id = $1",
    [id],
    (error, resultado) => {
      if (id == "9491b13c-cd5e-4fc9-8f13-3ec9069e24a9") {
        return res.status(200).json(resultado.rows);
      } else {
        return res.status(200).json(resultado.rows);
      }
    }
  );
});

// altera um cadastro
router.patch("/", (req, res, next) => {
  const id_patch = req.body.id;
  const created_at_patch = req.body.created_at;
  const empresa_patch = req.body.empresa;
  const filial_patch = req.body.filial;
  const nome_patch = req.body.nome;
  const email_patch = req.body.email;
  const senha_patch = req.body.senha;
  const ddd_patch = req.body.ddd;
  const telefone_patch = req.body.telefone;

  try {
    pool.query(
      `UPDATE usuarios 
                SET nome     = $1, 
                    email    = $2, 
                    senha    = $3, 
                    ddd      = $4,
                    telefone = $5
             WHERE id = $6 `,
      [
        nome_patch,
        email_patch,
        senha_patch,
        ddd_patch,
        telefone_patch,
        id_patch,
      ],
      (error, resultado, field) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        return res.status(201).send({
          mensagem: "Cadastro alterado com sucesso.",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// exclui um cadastro
router.delete("/", async (req, res, next) => {
  const id = req.query.id;
  try {
    pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    return res.status(202).send({ mensagem: "Usuario excluido com sucesso." });
  } catch (err) {
    return res.status(500).send(err);
  }
});

/*
  Rota para validar se o usuario e senha informado na tela de login esta valido no banco de dados.
*/
router.post("/login", async (req, res) => {
  const senhaLoginFormulario = req.body.senha;
  const emailLoginFormulario = req.body.email;
  if (!emailLoginFormulario.trim()) {
    return res.status(400).json({mensagem: 'E-mail obrigatório'});
  } else if (!senhaLoginFormulario.trim()) {
    return res.status(400).json({mensagem: 'Senha obrigatório'});
  }
  try {
    let login = await pool.query(
      "SELECT id, created_at, empresa, filial, nome, email, senha, ddd, telefone, delete FROM usuarios WHERE delete = false AND email = $1",
      [req.body.email]
    );

    if (login.rows.length < 1) {
      return res.status(401).send({ mensagem: "Falha na autenticação" });
    }
    const { senha, email } = login.rows[0];
    const autorizado = bcrypt.compareSync(senhaLoginFormulario, senha);

    if (!autorizado) {
      return res.status(401).send({ mensagem: "Falha na autenticação" });
    }

    if (autorizado) {
      return res.status(200).send({ mensagem: "Autenticado com sucesso" });
    }
    return res.status(401).send({ mensagem: "Falha na autenticação" });
  } catch (erro) {
    return res.status(500).send({ error: erro });
  }
});

/*
  Função para remover caracter especial de campos textos.
*/
function removeCharSpecial(text) {
  var newText = String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return newText;
}

/*
  Função para tratar o numero do telefone que vem no formato (62)993497695
*/
function trataTelefone(numeroTelefone) {
  var numeroTelefoneTexto = "";
  var numeroTelefoneTratado = "";

  // se nao informou o numero retorna.
  if (!numeroTelefone.trim()) {
    return numeroTelefone;
  }

  if (typeof numeroTelefone === "number") {
    numeroTelefoneTexto = numeroTelefone.toString();
    numeroTelefoneTratado = numeroTelefoneTexto.replace("(", "");
    numeroTelefoneTratado = numeroTelefoneTratado.replace(")", "");
  } else if (typeof numeroTelefone.trim() === "string") {
    numeroTelefoneTratado = numeroTelefone.replace("(", "");
    numeroTelefoneTratado = numeroTelefoneTratado.replace(")", "");
    numeroTelefoneTratado = numeroTelefoneTratado.replace("-", "");
    numeroTelefoneTratado = numeroTelefoneTratado.replace(".", "");
    numeroTelefoneTratado = numeroTelefoneTratado.substring(2, 15);
  } else {
    //                       993497695
    numeroTelefoneTratado = "999999999";
  }

  return numeroTelefoneTratado;
}

/*
  Função para retornar o DDD do numero informado
*/
function retornaDdd(telefoneTexto) {
  var ddd = "";
  console.log("DDD do telefone 01: ", telefoneTexto.trim());

  if (!telefoneTexto.trim()) {
    return telefoneTexto;
  }

  ddd = telefoneTexto.replace("(", "");
  ddd = ddd.replace(")", "");
  ddd = ddd.substring(0, 2);
  telefoneTexto = ddd;
  if (typeof telefoneTexto === "string") {
    ddd = telefoneTexto.trim().substring(0, 2);
  } else {
    ddd = "99";
  }

  return ddd;
}

module.exports = router;
