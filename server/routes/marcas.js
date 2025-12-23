const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota de Listagem
// Busca todas as marcas e ordena alfabeticamente (A-Z).
// Isso é essencial para que o menu suspenso (dropdown) no frontend fique organizado.
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM marcas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar a lista de marcas." });
    }
});

// Rota de Criação
// Adiciona uma nova marca ao banco de dados.
router.post('/', async (req, res) => {
    const { nome } = req.body;
    
    // Validação simples: não faz sentido criar uma marca sem nome.
    if (!nome) return res.status(400).json({ error: "O nome da marca é obrigatório." });

    try {
        await db.query('INSERT INTO marcas (nome) VALUES (?)', [nome]);
        res.status(201).json({ message: "Marca criada com sucesso!" });
    } catch (error) {
        // Tratamento de erro específico para duplicidade (Erro 1062 do MySQL).
        // Evita ter "Nike" e "Nike" duas vezes na lista.
        if (error.errno === 1062) {
            return res.status(400).json({ error: "Esta marca já está cadastrada." });
        }
        res.status(500).json({ error: "Erro ao salvar a marca." });
    }
});

// Rota de Exclusão com Verificação de Segurança
// Antes de apagar, precisamos garantir que nenhuma peça de roupa dependa dessa marca.
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificação de Vínculo:
        // Perguntamos ao banco: "Existem produtos que usam esta marca?"
        const [produtos] = await db.query('SELECT sku FROM produtos WHERE marca_id = ?', [id]);
        
        // Se a resposta for sim, bloqueamos a exclusão.
        if (produtos.length > 0) {
            return res.status(400).json({ 
                error: `Ação bloqueada: Existem ${produtos.length} produtos vinculados a esta marca. Remova os produtos primeiro.` 
            });
        }

        // 2. Exclusão:
        // Se chegamos aqui, é seguro apagar.
        await db.query('DELETE FROM marcas WHERE id = ?', [id]);
        res.json({ message: "Marca excluída com sucesso." });

    } catch (error) {
        res.status(500).json({ error: "Erro ao tentar excluir a marca." });
    }
});

module.exports = router;