import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, LogOut, Edit, Trash2, 
  ArrowUp, ArrowDown, Tag, User, BarChart3,
  Filter, XCircle 
} from 'lucide-react';
import { calcularPrecificacao } from '../utils/calculosFiscais';

export default function ProdutosLista() {
  const navigate = useNavigate();
  
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [simularST, setSimularST] = useState(false);
  const [filtroPrejuizo, setFiltroPrejuizo] = useState(false); 

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_tabela4') || '{}');

  useEffect(() => { 
      carregarProdutos(); 
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await axios.get('/api/produtos');
      setProdutos(response.data);
    } catch (error) { 
        console.error("Erro ao carregar lista:", error); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario_tabela4');
    navigate('/');
  };

  const handleDeletar = async (sku, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
        try {
            await axios.delete(`/api/produtos/${sku}`);
            carregarProdutos();
        } catch (error) { 
            alert("Não foi possível excluir: " + error.message); 
        }
    }
  };

  const produtosFiltrados = produtos.filter(p => {
    const termo = busca.toLowerCase();
    const matchTexto = 
        p.nome.toLowerCase().includes(termo) || 
        p.sku.toLowerCase().includes(termo) ||
        (p.marca_nome && p.marca_nome.toLowerCase().includes(termo));

    if (filtroPrejuizo) {
        const res = calcularPrecificacao({ ...p, flag_simulacao_st: simularST });
        const temPrejuizo = res.classico.margem < 0 || res.premium.margem < 0;
        return matchTexto && temPrejuizo;
    }
    return matchTexto;
  });

  return (
    <div className="min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-main)] font-sans relative overflow-x-hidden transition-colors duration-300">
      
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Meus Produtos</h1>
                <p className="text-[var(--text-muted)] text-sm">Gerencie seu mix e analise a saúde financeira.</p>
            </div>

            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-4 py-2 rounded-2xl backdrop-blur-md">
                    <span className={`text-sm font-bold ${simularST ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                        {simularST ? '⚡ ST Ressarcido' : 'ST Padrão'}
                    </span>
                    <button 
                        onClick={() => setSimularST(!simularST)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${simularST ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${simularST ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center gap-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-4 py-2 rounded-full backdrop-blur-md">
                     <button onClick={() => navigate('/dashboard')} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" title="Ir para Dashboard">
                        <BarChart3 size={18} />
                     </button>
                     <button onClick={() => navigate('/marcas')} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" title="Gerenciar Marcas">
                        <Tag size={18} />
                     </button>
                     <button onClick={() => navigate('/usuarios')} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" title="Gerenciar Usuários">
                        <User size={18} />
                     </button>
                     
                     <div className="w-px h-6 border-l border-[var(--glass-border)] mx-2"></div>

                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                        {usuarioLogado.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-1" title="Sair">
                        <LogOut size={18} />
                     </button>
                 </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por SKU, Nome ou Marca..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl py-3 pl-12 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
                    />
                </div>

                <button 
                    onClick={() => setFiltroPrejuizo(!filtroPrejuizo)}
                    className={`px-4 py-3 rounded-2xl font-bold border flex items-center gap-2 transition-all whitespace-nowrap
                        ${filtroPrejuizo 
                            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:scale-105'
                        }`}
                >
                    {filtroPrejuizo ? <XCircle size={20} /> : <Filter size={20} />}
                    {filtroPrejuizo ? 'Limpar Filtro' : 'Apenas Prejuízo'}
                </button>
            </div>

            <button 
                onClick={() => navigate('/produtos/novo')}
                className="w-full md:w-auto bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Novo Produto
            </button>
        </div>

        <div className="login-card w-full rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--glass-bg)] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--glass-border)]">
                            <th className="p-5 font-semibold">SKU / Marca</th>
                            <th className="p-5 font-semibold">Produto</th>
                            <th className="p-5 font-semibold text-right">Custo Base</th>
                            <th className="p-5 font-semibold text-right text-blue-500">Clássico</th>
                            <th className="p-5 font-semibold text-right text-purple-500">Premium</th>
                            <th className="p-5 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)] text-sm">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-[var(--text-muted)] animate-pulse">Carregando catálogo...</td></tr>
                        ) : produtosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-16 text-center text-[var(--text-muted)]">
                                    {filtroPrejuizo 
                                        ? "Parabéns! Nenhum produto operando com prejuízo neste cenário." 
                                        : "Nenhum produto encontrado na sua busca."}
                                </td>
                            </tr>
                        ) : (
                            produtosFiltrados.map((prod) => {
                                const resultados = calcularPrecificacao({ ...prod, flag_simulacao_st: simularST });
                                
                                return (
                                <tr key={prod.sku} className="hover:bg-[var(--glass-bg)] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-mono font-bold">{prod.sku}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{prod.marca_nome || 'Sem Marca'}</div>
                                    </td>
                                    <td className="p-5 font-medium max-w-[200px] truncate" title={prod.nome}>
                                        {prod.nome}
                                    </td>
                                    <td className="p-5 text-right font-mono text-[var(--text-muted)]">
                                        {Number(prod.custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    
                                    <td className="p-5 text-right font-mono">
                                        <div className="text-blue-500 font-bold">
                                            {Number(prod.preco_classico).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className={`text-xs flex justify-end items-center gap-1 ${resultados.classico.margem >= 0 ? 'text-green-500' : 'text-red-500 font-bold'}`}>
                                            {resultados.classico.margem.toFixed(1)}%
                                            {resultados.classico.margem >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
                                        </div>
                                    </td>

                                    <td className="p-5 text-right font-mono">
                                        <div className="text-purple-500 font-bold">
                                            {Number(prod.preco_premium).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className={`text-xs flex justify-end items-center gap-1 ${resultados.premium.margem >= 0 ? 'text-green-500' : 'text-red-500 font-bold'}`}>
                                            {resultados.premium.margem.toFixed(1)}%
                                            {resultados.premium.margem >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
                                        </div>
                                    </td>

                                    <td className="p-5 flex justify-center gap-2">
                                        <button 
                                            className="p-2 hover:bg-purple-500/20 text-[var(--text-muted)] hover:text-purple-500 rounded-lg transition-colors"
                                            onClick={() => navigate(`/produtos/editar/${prod.sku}`)}
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            className="p
