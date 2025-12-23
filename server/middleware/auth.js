const db = require('../db');

const verificarPermissao = async (req, res, next) => {
    // 1. Exceções de Autenticação
    // O login e o registo de novos usuários precisam ser públicos, 
    // caso contrário ninguém consegue entrar no sistema pela primeira vez.
    if (req.path.includes('/login') || (req.path === '/api/usuarios' && req.method === 'POST')) {
        return next();
    }

    // 2. Política de Leitura
    // Decidimos que a visualização de dados (GET) é livre. 
    // A restrição aplica-se apenas quando tentam modificar dados.
    if (req.method === 'GET') {
        return next();
    }

    // 3. Identificação do Usuário
    // Buscamos o ID enviado pelo Frontend no cabeçalho personalizado.
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: "Acesso negado. Usuário não identificado." });
    }

    try {
        // Verifica no banco de dados qual é o cargo (perfil) deste usuário
        const [rows] = await db.query('SELECT cargo FROM usuarios WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuário inválido ou não encontrado." });
        }

        const cargo = rows[0].cargo;

        // 4. Regra do Perfil 'Visita'
        // Visitantes podem navegar à vontade (já tratado no passo 2), 
        // mas bloqueamos qualquer tentativa de escrita (POST, PUT, DELETE).
        if (cargo === 'visita') {
            return res.status(403).json({ 
                error: "MODO VISITA: Você pode simular os cálculos, mas não tem permissão para salvar alterações no banco." 
            });
        }

        // Se passou por todas as barreiras, permite o acesso à rota destino
        next();

    } catch (error) {
        console.error("Erro no middleware de auth:", error);
        return res.status(500).json({ error: "Erro interno ao verificar permissões." });
    }
};

module.exports = verificarPermissao;