const express = require("express");
const router = express.Router();
const pool = require("../postgres");
const { format, parseISO } = require("date-fns");

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
  console.log(data);

  try {
    const insert = await pool.query(
      "INSERT INTO usuarios (empresa, filial, nome, email, senha, ddd, telefone, delete) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        req.body.empresa,
        req.body.filial,
        removeCharSpecial(req.body.nome),
        req.body.email,
        req.body.senha,
        req.body.ddd,
        req.body.telefone,
        req.body.delete
      ]
    );
    console.log("Insert: ",insert);
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

function removeCharSpecial(text) {
  var newText = String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return newText;
}

module.exports = router;
