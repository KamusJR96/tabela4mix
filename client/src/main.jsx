import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios';

// 1. Definição do Ambiente (Local vs Nuvem)
// Verifica se existe uma variável de ambiente configurada (produção).
// Se não existir, assume que estamos rodando localmente na porta 3001.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 2. Configuração Global do Axios
// Define a URL base para todas as chamadas HTTP.
// Assim, no resto do código, basta chamar '/api/produtos' em vez do endereço completo.
axios.defaults.baseURL = apiUrl;

// 3. Interceptador de Segurança (O "Crachá" Digital)
// Antes de qualquer requisição sair do computador do usuário em direção ao servidor,
// este bloco verifica se há um usuário logado e anexa o ID dele no cabeçalho.
// Isso garante que o Backend saiba exatamente "quem" está pedindo os dados.
axios.interceptors.request.use((config) => {
  const usuarioLogado = localStorage.getItem('usuario_tabela4');
  
  if (usuarioLogado) {
    const user = JSON.parse(usuarioLogado);
    config.headers['x-user-id'] = user.id;
  }
  
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)