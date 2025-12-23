import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, LogOut, Edit, Trash2, 
  ArrowUp, ArrowDown, Tag, User, BarChart3,
  Filter, XCircle 
} from 'lucide-react';
import { calcularPrecificacao } from '../utils/calculosFiscais'; // O cérebro matemático

export default function ProdutosLista() {
  const navigate = useNavigate();
  
  // Estados de Dados
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Controle (Filtros e Simulação)
  const [busca, setBusca] = useState('');
  const [simularST, setSimularST] = useState(false); // Permite simular cenário sem imposto direto na lista
  const [filtroPrejuizo, setFiltroPrejuizo] = useState(false); // Filtro rápido para achar problemas

  // Recupera dados do usuário para mostrar o avatar/iniciais
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_tabela4') || '{}');

  // Carga Inicial
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
            // Atualiza a lista visualmente removendo o item excluído
            carregarProdutos();
        } catch (error) { 
            alert("Não foi possível excluir: " + error.message); 
        }
    }
  };

  // --- MOTOR DE FILTRAGEM INTELIGENTE ---
  // Esta lógica roda toda vez que o usuário digita algo ou clica nos botões de filtro.
  const produtosFiltrados = produtos.filter(p => {
    // 1. Filtro Textual: Procura no Nome, SKU ou Marca
    const termo = busca.toLowerCase();
    const matchTexto = 
        p.nome.toLowerCase().includes(termo) || 
        p.sku.toLowerCase().includes(termo) ||
        (p.marca_nome && p.marca_nome.toLowerCase().includes(termo));

    // 2. Filtro de Auditoria (Apenas Prejuízo)
    if (filtroPrejuizo) {
        // Precisamos calcular a precificação AGORA para saber se este produto dá prejuízo
        // Note que passamos o estado 'simularST', então o filtro obedece à simulação!
        const res = calcularPrecificacao({ ...p, flag_simulacao_st: simularST });
        const temPrejuizo = res.classico.margem < 0 || res.premium.margem < 0;
        
        // Só retorna o produto se ele atender ao texto E tiver margem negativa
        return matchTexto && temPrejuizo;
    }

    // Se o filtro de prejuízo estiver desligado, retorna apenas o match de texto
    return matchTexto;
  });

  return (
    <div className="min-h-screen w-full bg-[#0f1014] text-white font-sans relative overflow-x-hidden">
      
      {/* Elementos Ambientais (Fundo) */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        
        {/* CABEÇALHO E NAVEGAÇÃO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Meus Produtos</h1>
                <p className="text-gray-400 text-sm">Gerencie seu mix e analise a saúde financeira.</p>
            </div>

            <div className="flex items-center gap-4">
                 {/* Interruptor de Simulação ST */}
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                    <span className={`text-sm font-bold ${simularST ? 'text-green-400' : 'text-gray-400'}`}>
                        {simularST ? '⚡ ST Ressarcido' : 'ST Padrão'}
                    </span>
                    <button 
                        onClick={() => setSimularST(!simularST)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${simularST ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${simularST ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>

                 {/* Menu Rápido */}
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                     <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-white transition-colors" title="Ir para Dashboard">
                        <BarChart3 size={18} />
                     </button>
                     <button onClick={() => navigate('/marcas')} className="p-2 text-gray-400 hover:text-white transition-colors" title="Gerenciar Marcas">
                        <Tag size={18} />
                     </button>
                     <button onClick={() => navigate('/usuarios')} className="p-2 text-gray-400 hover:text-white transition-colors" title="Gerenciar Usuários">
                        <User size={18} />
                     </button>
                     
                     <div className="w-px h-6 bg-white/10 mx-2"></div>

                     {/* Avatar do Usuário */}
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-lg">
                        {usuarioLogado.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors ml-1" title="Sair">
                        <LogOut size={18} />
                     </button>
                 </div>
            </div>
        </div>

        {/* BARRA DE FERRAMENTAS (Busca e Filtros) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                {/* Campo de Busca */}
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por SKU, Nome ou Marca..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-[#00000040] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all shadow-inner"
                    />
                </div>

                {/* Botão Filtro de Prejuízo */}
                <button 
                    onClick={() => setFiltroPrejuizo(!filtroPrejuizo)}
                    className={`px-4 py-3 rounded-2xl font-bold border flex items-center gap-2 transition-all whitespace-nowrap
                        ${filtroPrejuizo 
                            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    {filtroPrejuizo ? <XCircle size={20} /> : <Filter size={20} />}
                    {filtroPrejuizo ? 'Limpar Filtro' : 'Apenas Prejuízo'}
                </button>
            </div>

            {/* Botão Novo Produto */}
            <button 
                onClick={() => navigate('/produtos/novo')}
                className="w-full md:w-auto bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Novo Produto
            </button>
        </div>

        {/* TABELA DE DADOS */}
        <div className="login-card w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                            <th className="p-5 font-semibold">SKU / Marca</th>
                            <th className="p-5 font-semibold">Produto</th>
                            <th className="p-5 font-semibold text-right">Custo Base</th>
                            <th className="p-5 font-semibold text-right text-blue-300">Clássico</th>
                            <th className="p-5 font-semibold text-right text-purple-300">Premium</th>
                            <th className="p-5 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-500 animate-pulse">Carregando catálogo...</td></tr>
                        ) : produtosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-16 text-center text-gray-500">
                                    {filtroPrejuizo 
                                        ? "Parabéns! Nenhum produto operando com prejuízo neste cenário." 
                                        : "Nenhum produto encontrado na sua busca."}
                                </td>
                            </tr>
                        ) : (
                            produtosFiltrados.map((prod) => {
                                // Cálculo individual por linha para exibir as margens atualizadas
                                const resultados = calcularPrecificacao({ ...prod, flag_simulacao_st: simularST });
                                
                                return (
                                <tr key={prod.sku} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-mono text-gray-300 font-bold">{prod.sku}</div>
                                        <div className="text-xs text-gray-500">{prod.marca_nome || 'Sem Marca'}</div>
                                    </td>
                                    <td className="p-5 font-medium text-white max-w-[200px] truncate" title={prod.nome}>
                                        {prod.nome}
                                    </td>
                                    <td className="p-5 text-right text-gray-400 font-mono">
                                        {Number(prod.custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    
                                    {/* Coluna Clássico */}
                                    <td className="p-5 text-right font-mono">
                                        <div className="text-blue-200 font-bold">
                                            {Number(prod.preco_classico).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className={`text-xs flex justify-end items-center gap-1 ${resultados.classico.margem >= 0 ? 'text-green-500' : 'text-red-500 font-bold'}`}>
                                            {resultados.classico.margem.toFixed(1)}%
                                            {resultados.classico.margem >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
                                        </div>
                                    </td>

                                    {/* Coluna Premium */}
                                    <td className="p-5 text-right font-mono">
                                        <div className="text-purple-200 font-bold">
                                            {Number(prod.preco_premium).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className={`text-xs flex justify-end items-center gap-1 ${resultados.premium.margem >= 0 ? 'text-green-500' : 'text-red-500 font-bold'}`}>
                                            {resultados.premium.margem.toFixed(1)}%
                                            {resultados.premium.margem >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
                                        </div>
                                    </td>

                                    <td className="p-5 flex justify-center gap-2">
                                        <button 
                                            className="p-2 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded-lg transition-colors"
                                            onClick={() => navigate(`/produtos/editar/${prod.sku}`)}
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            onClick={() => handleDeletar(prod.sku, prod.nome)}
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )}) 
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}