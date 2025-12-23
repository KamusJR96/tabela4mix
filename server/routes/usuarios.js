const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Biblioteca responsável pela criptografia das senhas

// Rota de Login
// O coração da autenticação. Recebe as credenciais e decide se libera o acesso.
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    
    try {
        // 1. Busca o usuário pelo nome (login)
        const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado." });
        }

        const user = rows[0];
        let senhaValida = false;

        // 2. Verificação Híbrida de Senha
        // Precisamos suportar dois cenários:
        // A) Senhas novas: Estão criptografadas (começam com $2b$). Usamos bcrypt.compare.
        // B) Senhas antigas: Estão em texto puro. Comparamos diretamente.
        // Nota: Idealmente, todos deveriam migrar para hash, mas isso mantém o sistema funcionando para todos.
        if (user.senha_hash.startsWith('$2b$')) {
             senhaValida = await bcrypt.compare(senha, user.senha_hash);
        } else {
             senhaValida = (senha === user.senha_hash);
        }

        // 3. Resultado
        if (senhaValida) {
            // Retorna apenas dados seguros (sem a senha) para o frontend usar
            res.json({ 
                sucesso: true, 
                usuario: { id: user.id, nome: user.usuario, cargo: user.cargo } 
            });
        } else {
            res.status(401).json({ error: "Senha incorreta." });
        }

    } catch (error) {
        res.status(500).json({ error: "Erro interno no processo de login." });
    }
});

// Rota de Listagem
// Mostra quem tem acesso ao sistema.
// Importante: Selecionamos campos específicos para garantir que a coluna 'senha_hash' JAMAIS seja enviada.
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, usuario, cargo FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar usuários." });
    }
});

// Rota de Cadastro (Registro)
// Cria novos acessos garantindo que a senha seja salva de forma segura.
router.post('/', async (req, res) => {
    const { usuario, senha, cargo } = req.body;
    
    // Validação básica
    if (!usuario || !senha) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    }

    try {
        // Criptografia:
        // O 'saltRounds' define a complexidade do embaralhamento. 10 é o padrão atual de mercado.
        // Isso transforma "123456" em algo ilegível como "$2b$10$XyZ..."
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        // Define 'colaborador' como padrão se nenhum cargo for informado
        const cargoFinal = cargo || 'colaborador';

        await db.query('INSERT INTO usuarios (usuario, senha_hash, cargo) VALUES (?, ?, ?)', 
            [usuario, hash, cargoFinal]);
            
        res.status(201).json({ message: "Usuário criado com segurança!" });

    } catch (error) {
        // Tratamento para evitar usuários com o mesmo nome (Erro 1062)
        if (error.errno === 1062) {
            return res.status(400).json({ error: "Este nome de usuário já está em uso." });
        }
        res.status(500).json({ error: "Erro ao criar usuário." });
    }
});

// Rota de Exclusão
// Remove o acesso de um usuário.
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ message: "Usuário removido com sucesso." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover usuário." });
    }
});

module.exports = router;