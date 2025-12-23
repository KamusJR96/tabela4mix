require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Garante que o Node encontre o certificado SSL independentemente de onde o script for iniciado
const sslCertPath = path.join(__dirname, 'isrgrootx1.pem');

// Validação de segurança: sem o certificado, a conexão com a nuvem falhará.
// Melhor avisar agora e parar do que tentar conectar e receber erros estranhos.
if (!fs.existsSync(sslCertPath)) {
    console.error("❌ ERRO CRÍTICO: O arquivo 'isrgrootx1.pem' não foi encontrado na pasta server.");
    process.exit(1);
}

// Criação do Pool de Conexões.
// O pool mantém conexões abertas e reutilizáveis, o que é muito mais rápido 
// do que abrir e fechar uma conexão para cada usuário que acessa o site.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        ca: fs.readFileSync(sslCertPath),
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    // Mantemos um limite conservador (5) para não estourar os limites da camada gratuita do TiDB
    connectionLimit: 5, 
    queueLimit: 0
});

// Faz um "ping" imediato ao banco assim que o servidor liga.
// Isso serve apenas para termos certeza visual no terminal de que está tudo certo.
pool.getConnection((err, conn) => {
    if (err) {
        console.error("❌ Falha na conexão com TiDB:", err.message);
    } else {
        console.log("✅ Conectado com sucesso ao TiDB Cloud!");
        conn.release();
    }
});

module.exports = pool.promise();