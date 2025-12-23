const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota de Listagem (Dashboard)
// Busca todos os produtos e faz a junção (JOIN) com a tabela de marcas.
// Usamos LEFT JOIN para garantir que o produto apareça mesmo se a marca tiver sido deletada.
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, m.nome as marca_nome 
            FROM produtos p 
            LEFT JOIN marcas m ON p.marca_id = m.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar produtos." });
    }
});

// Rota de Detalhes
// Busca um produto específico pelo SKU. Essencial para preencher o formulário de edição.
router.get('/:sku', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM produtos WHERE sku = ?', [req.params.sku]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar detalhes do produto." });
    }
});

// Rota de Criação
// Recebe os dados do frontend e insere no banco.
router.post('/', async (req, res) => {
    const dados = req.body;
    
    // Query de inserção mapeando todas as colunas da tabela
    const sql = `
        INSERT INTO produtos (
            sku, nome, marca_id, custo, 
            icms_entrada, st, ipi, icms_saida, 
            frete_ml, difal, 
            preco_classico, preco_premium,
            preco_conc_classico, preco_conc_premium
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dados.sku, dados.nome, dados.marca_id, dados.custo,
        dados.icms_entrada, dados.st, dados.ipi, dados.icms_saida,
        dados.frete_ml, dados.difal,
        dados.preco_classico, dados.preco_premium,
        dados.preco_conc_classico, dados.preco_conc_premium
    ];

    try {
        await db.query(sql, valores);
        res.status(201).json({ message: "Produto cadastrado com sucesso!" });
    } catch (error) {
        // Tratamento especial: Erro 1062 é o código do MySQL para "Duplicate Entry" (Chave duplicada).
        // Assim o usuário recebe uma mensagem clara se tentar criar um SKU que já existe.
        if (error.errno === 1062) {
            return res.status(400).json({ error: "Já existe um produto com este SKU." });
        }
        res.status(500).json({ error: "Erro ao salvar o produto." });
    }
});

// Rota de Atualização
// Atualiza os dados baseados no SKU passado na URL (req.params.sku).
router.put('/:sku', async (req, res) => {
    const skuOriginal = req.params.sku;
    const dados = req.body;

    const sql = `
        UPDATE produtos SET
            nome=?, marca_id=?, custo=?, 
            icms_entrada=?, st=?, ipi=?, icms_saida=?, 
            frete_ml=?, difal=?, 
            preco_classico=?, preco_premium=?,
            preco_conc_classico=?, preco_conc_premium=?
        WHERE sku = ?
    `;

    const valores = [
        dados.nome, dados.marca_id, dados.custo,
        dados.icms_entrada, dados.st, dados.ipi, dados.icms_saida,
        dados.frete_ml, dados.difal,
        dados.preco_classico, dados.preco_premium,
        dados.preco_conc_classico, dados.preco_conc_premium,
        skuOriginal // O WHERE usa este valor para encontrar o produto certo
    ];

    try {
        await db.query(sql, valores);
        res.json({ message: "Produto atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar o produto." });
    }
});

// Rota de Exclusão
// Remove permanentemente o registro do banco.
router.delete('/:sku', async (req, res) => {
    try {
        await db.query('DELETE FROM produtos WHERE sku = ?', [req.params.sku]);
        res.json({ message: "Produto excluído." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao excluir o produto." });
    }
});

module.exports = router;