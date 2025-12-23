// server/criarAdmin.js
const db = require('./db');
const bcrypt = require('bcrypt');

async function criarAdminDeResgate() {
    const usuario = 'gabrielnovo';
    const senha = '#Kamusjr123'; // Sua senha padrão
    const cargo = 'admin';

    console.log("⏳ Criando usuário de resgate...");

    try {
        // 1. Criptografa a senha
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        // 2. Insere no banco
        await db.query('INSERT INTO usuarios (usuario, senha_hash, cargo) VALUES (?, ?, ?)', 
            [usuario, hash, cargo]);

        console.log("✅ SUCESSO! Usuário criado.");
        console.log(`👤 Usuário: ${usuario}`);
        console.log(`🔑 Senha: ${senha}`);

    } catch (error) {
        if (error.errno === 1062) {
            console.log("⚠️  AVISO: O usuário 'admin' já existe no banco.");
            
            // Opcional: Se quiser resetar a senha de um admin existente, descomente a linha abaixo:
            // await db.query('UPDATE usuarios SET senha_hash = ? WHERE usuario = ?', [hash, usuario]);
            // console.log("🔄 Senha do admin foi resetada.");
        } else {
            console.error("❌ Erro ao criar:", error.message);
        }
    } finally {
        // Encerra o processo para não travar o terminal
        process.exit();
    }
}

criarAdminDeResgate();