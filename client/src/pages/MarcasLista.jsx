import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Tag } from 'lucide-react';
import InputGlass from '../components/InputGlass'; // Componente reutilizável de input

export default function MarcasLista() {
  const navigate = useNavigate();
  
  // Estado local
  const [marcas, setMarcas] = useState([]);
  const [novaMarca, setNovaMarca] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega a lista assim que a página abre
  useEffect(() => { 
      carregarMarcas(); 
  }, []);

  // 1. Função de Leitura (Read)
  const carregarMarcas = async () => {
    try {
      const res = await axios.get('/api/marcas');
      setMarcas(res.data);
    } catch (e) { 
        console.error("Erro ao buscar marcas:", e); 
    }
  };

  // 2. Função de Criação (Create)
  const adicionarMarca = async (e) => {
    e.preventDefault();
    if(!novaMarca) return; // Evita envio vazio

    setLoading(true);
    try {
      await axios.post('/api/marcas', { nome: novaMarca });
      
      // Limpa o campo e recarrega a lista para mostrar o item novo
      setNovaMarca('');
      carregarMarcas();

    } catch (e) {
      // Aqui capturamos o erro 400 (Duplicidade) que configuramos no backend
      alert("Atenção: " + (e.response?.data?.error || "Falha ao criar marca."));
    } finally { 
      setLoading(false); 
    }
  };

  // 3. Função de Exclusão (Delete)
  const deletarMarca = async (id) => {
    // Confirmação de segurança no navegador
    if(!window.confirm("Tem certeza que deseja excluir esta marca?")) return;

    try {
      await axios.delete(`/api/marcas/${id}`);
      carregarMarcas();
    } catch (e) {
      // Importante: Se a marca tiver produtos, o backend devolve erro 400.
      // Mostramos a mensagem explicativa ("Existem X produtos...") para o usuário.
      alert("Não foi possível excluir: " + (e.response?.data?.error || "Erro desconhecido."));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f1014] text-white font-sans p-6 overflow-hidden relative">
       
       {/* Identidade Visual: Usamos tons alaranjados para diferenciar telas de Configuração */}
       <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="relative z-10 container mx-auto max-w-2xl">
          
          {/* Cabeçalho de Navegação */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/produtos')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Gerenciar Marcas</h1>
          </div>

          {/* Área de Cadastro */}
          <div className="login-card p-6 rounded-3xl bg-white/[0.02] mb-8">
             <form onSubmit={adicionarMarca} className="flex gap-4 items-end">
                <div className="flex-1">
                   <InputGlass 
                      label="Nova Marca" 
                      value={novaMarca} 
                      onChange={(e) => setNovaMarca(e.target.value)} 
                      placeholder="Ex: Deca, Docol, Tramontina..."
                      icon={Tag}
                   />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                   {loading ? <span className="animate-pulse">...</span> : <Plus size={24} />}
                </button>
             </form>
          </div>

          {/* Lista de Itens */}
          <div className="login-card rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
             <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                   <tr>
                      <th className="p-4">Nome da Marca</th>
                      <th className="p-4 text-right">Ações</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {marcas.map(m => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium">{m.nome}</td>
                          <td className="p-4 text-right">
                             <button 
                                onClick={() => deletarMarca(m.id)} 
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir Marca"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                      </tr>
                   ))}
                   {marcas.length === 0 && (
                       <tr>
                           <td colSpan="2" className="p-8 text-center text-gray-500">
                               Nenhuma marca cadastrada ainda.
                           </td>
                       </tr>
                   )}
                </tbody>
             </table>
          </div>

       </div>
    </div>
  );
}