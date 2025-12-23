import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Páginas do Sistema
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProdutosLista from './pages/ProdutosLista';
import ProdutoForm from './pages/ProdutoForm';
import MarcasLista from './pages/MarcasLista';
import UsuariosLista from './pages/UsuariosLista';

// Componente de Segurança (Guarda de Rotas)
// Funciona como um porteiro: verifica se o usuário tem uma credencial salva no navegador.
// Se não tiver (null), redireciona automaticamente de volta para a tela de Login.
const RotaPrivada = ({ children }) => {
  const usuario = localStorage.getItem('usuario_tabela4');
  return usuario ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Acesso Público */}
        <Route path="/" element={<Login />} />

        {/* 2. Área Restrita (Exige Login) */}
        
        {/* Visão Geral */}
        <Route path="/dashboard" element={<RotaPrivada><Dashboard /></RotaPrivada>} />

        {/* Gestão de Produtos */}
        {/* Note que reaproveitamos o componente 'ProdutoForm' para criar E editar */}
        <Route path="/produtos" element={<RotaPrivada><ProdutosLista /></RotaPrivada>} />
        <Route path="/produtos/novo" element={<RotaPrivada><ProdutoForm /></RotaPrivada>} />
        <Route path="/produtos/editar/:sku" element={<RotaPrivada><ProdutoForm /></RotaPrivada>} />
        
        {/* Cadastros Auxiliares (Configurações) */}
        <Route path="/marcas" element={<RotaPrivada><MarcasLista /></RotaPrivada>} />
        <Route path="/usuarios" element={<RotaPrivada><UsuariosLista /></RotaPrivada>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;