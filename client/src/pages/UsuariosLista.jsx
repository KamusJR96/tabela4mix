import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, UserPlus, User, Lock, Shield } from 'lucide-react';
import InputGlass from '../components/InputGlass'; // Componente de input padronizado

export default function UsuariosLista() {
  const navigate = useNavigate();
  
  // Estado da Lista
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado do Formulário
  // Segurança por Design: Definimos 'visita' como padrão.
  // Se alguém criar um usuário apressado, ele terá o mínimo de privilégios possível.
  const [form, setForm] = useState({ usuario: '', senha: '', cargo: 'visita' });

  // Carregamento Inicial
  useEffect(() => { 
      carregarUsuarios(); 
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await axios.get('/api/usuarios');
      setUsuarios(res.data);
    } catch (e) { 
        console.error("Erro ao listar usuários:", e); 
    }
  };

  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia os dados para o backend (que vai criptografar a senha)
      await axios.post('/api/usuarios', form);
      
      // Feedback e Limpeza
      alert("Usuário criado com sucesso!");
      setForm({ usuario: '', senha: '', cargo: 'visita' }); // Reseta mantendo o padrão seguro
      carregarUsuarios();

    } catch (e) {
      alert("Erro ao criar: " + (e.response?.data?.error || "Verifique os dados."));
    } finally { 
      setLoading(false); 
    }
  };

  const deletarUsuario = async (id) => {
    // Confirmação crítica para evitar bloqueios acidentais
    if(!window.confirm("Tem certeza que deseja remover este acesso permanentemente?")) return;
    
    try {
      await axios.delete(`/api/usuarios/${id}`);
      carregarUsuarios();
    } catch (e) { 
      alert("Erro ao excluir usuário."); 
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f1014] text-white font-sans p-6 overflow-hidden relative">
       
       {/* Ambientação Visual (Roxo para remeter a Administração/Segurança) */}
       <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="relative z-10 container mx-auto max-w-4xl">
          
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/produtos')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
                <p className="text-gray-400 text-sm">Controle quem acessa e modifica o sistema.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
             {/* COLUNA 1: Formulário de Cadastro */}
             <div className="md:col-span-1">
                <div className="login-card p-6 rounded-3xl bg-white/[0.02] border border-white/5 sticky top-6">
                   <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase flex items-center gap-2">
                       <UserPlus size={16}/> Novo Acesso
                   </h3>
                   
                   <form onSubmit={adicionarUsuario} className="space-y-4">
                      <InputGlass 
                          label="Usuário" 
                          icon={User} 
                          value={form.usuario} 
                          onChange={e => setForm({...form, usuario: e.target.value})} 
                          placeholder="Ex: joao.silva"
                          required 
                      />
                      <InputGlass 
                          label="Senha" 
                          type="password" 
                          icon={Lock} 
                          value={form.senha} 
                          onChange={e => setForm({...form, senha: e.target.value})} 
                          placeholder="******"
                          required 
                      />
                      
                      {/* Seletor de Cargo Customizado */}
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Nível de Permissão</label>
                          <div className="relative">
                              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                              <select 
                                 className="w-full bg-[#00000040] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:border-purple-500/50 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                                 value={form.cargo}
                                 onChange={e => setForm({...form, cargo: e.target.value})}
                              >
                                 <option value="visita">Visita (Somente Leitura)</option>
                                 <option value="admin">Administrador (Total)</option>
                              </select>
                          </div>
                          <p className="text-[10px] text-gray-500 px-1">
                              {form.cargo === 'admin' 
                                ? '⚠️ Pode criar, editar e excluir tudo.' 
                                : 'ℹ️ Pode apenas visualizar e simular.'}
                          </p>
                      </div>

                      <button 
                          type="submit" 
                          disabled={loading} 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4"
                      >
                         {loading ? 'Salvando...' : 'Cadastrar Usuário'}
                      </button>
                   </form>
                </div>
             </div>

             {/* COLUNA 2: Lista de Usuários Existentes */}
             <div className="md:col-span-2">
                <div className="login-card rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
                   <table className="w-full text-left">
                      <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                         <tr>
                            <th className="p-4">Usuário</th>
                            <th className="p-4">Permissão</th>
                            <th className="p-4 text-right">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {usuarios.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                               <td className="p-4 font-medium flex items-center gap-3">
                                  {/* Avatar Gerado Automaticamente */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner
                                      ${u.cargo === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                      {u.usuario.charAt(0).toUpperCase()}
                                  </div>
                                  {u.usuario}
                               </td>
                               <td className="p-4">
                                  {/* Badge de Cargo */}
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider
                                      ${u.cargo === 'admin' 
                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                     {u.cargo === 'admin' ? 'ADMINISTRADOR' : 'VISITANTE'}
                                  </span>
                               </td>
                               <td className="p-4 text-right">
                                  <button 
                                      onClick={() => deletarUsuario(u.id)} 
                                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Remover Acesso"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {usuarios.length === 0 && (
                             <tr><td colSpan="3" className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}