const express = require('express');
const cors = require('cors');
const db = require('./db');

// Middleware de segurança
const verificarPermissao = require('./middleware/auth');

// Importação das rotas específicas
const produtosRoutes = require('./routes/produtos');
const marcasRoutes = require('./routes/marcas');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Configurações básicas de entrada e saída de dados
app.use(cors());
app.use(express.json());

// Segurança Global:
// Aplica a verificação de permissão em todas as rotas abaixo.
// Se a validação falhar, a requisição nem chega aos endpoints.
app.use(verificarPermissao); 

// Definição dos endpoints da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota raiz para verificação de saúde da API (Health Check)
app.get('/', (req, res) => {
    res.json({ message: "Mix Mercado Livre Online" });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});