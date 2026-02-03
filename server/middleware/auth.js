const db = require('../db');

const verificarPermissao = async (req, res, next) => {
    const { method, path } = req;
    const userId = req.headers['x-user-id'];

    if (path.includes('/login')) {
        return next();
    }

    if (!userId) {
        return res.status(401).json({ error: "Acesso negado. Faça login para continuar." });
    }

    try {
        const [rows] = await db.query('SELECT cargo FROM usuarios WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuário inválido." });
        }

        const cargo = rows[0].cargo;

        if (path.includes('/api/usuarios')) {
            if (cargo !== 'admin') {
                return res.status(403).json({ 
                    error: "ACESSO RESTRITO: Apenas administradores podem gerenciar usuários." 
                });
            }
            return next();
        }

        if (method === 'GET') {
            return next();
        }

        if (cargo === 'visita') {
            return res.status(403).json({ 
                error: "MODO VISITA: Você não tem permissão para alterar dados." 
            });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
};

module.exports = verificarPermissao;