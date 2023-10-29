const express = require("express");
const router = express.Router();
const pool = require("../postgres");

// retorna todos os produtos da empresa
router.get("/", (req, res, next) => {
  try {
    pool.query(
      "SELECT id, created_at, empresa, filial, nome, descricao, categoria, delete FROM produto WHERE delete = false AND empresa = $1 AND filial = $2",
      [req.query.empresa],
      [req.query.field],
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

// insere um novo produto
router.post("/", async (req, res, next) => {
  
  //console.log("Nome: ", req.body.nome);

  try {
    const insert = await pool.query(
      "INSERT INTO produto (empresa, filial, nome, descricao, categoria, valor, delete) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        req.body.empresa,
        req.body.filial,
        req.body.nome,
        req.body.descricao,
        req.body.categoria,
        req.body.valor,
        req.body.delete,
      ]
    );

    return res.status(200).send({ mensagem: "Produto cadastrado com sucesso." });

  } catch (err) {
    return res.status(400).send(console.log(err));
  }
});

// retorna os dados do cadastro de produto.
router.get("/:id", (req, res) => {
  const id = req.query.id;
  const filial = req.query.filial;
  const nome = req.query.nome;

  pool.query(
    "SELECT A.empresa, A.filial, A.nome, A.descricao, A.categoria, A.delete FROM usuarios A WHERE A.delete = false AND A.id = $1",
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
  /* const id_patch = req.body.id;
  const created_at_patch = req.body.created_at; */
  const nome_patch = req.body.nome;
  const descricao_patch = req.body.descricao;
  const categoria_patch = req.body.categoria;

  try {
    pool.query(
      `UPDATE produto 
                SET nome     = $1, 
                descricao    = $2, 
                categoria    = $3,
                delete       = $4 
             WHERE id = $5 `,
      [
        nome_patch,
        descricao_patch,
        categoria_patch,
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

// exclui um cadastro de produto fisicamente
router.delete("/", async (req, res, next) => {
  const id = req.query.id;
  try {
    pool.query("DELETE FROM produto WHERE id = $1", [id]);
    return res.status(202).send({ mensagem: "Produto excluido com sucesso." });
  } catch (err) {
    return res.status(500).send(err);
  }
});


module.exports = router;
