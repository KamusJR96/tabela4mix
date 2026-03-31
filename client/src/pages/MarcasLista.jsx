import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Tag } from 'lucide-react';
import InputGlass from '../components/InputGlass';

export default function MarcasLista() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);
  const [novaMarca, setNovaMarca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
      carregarMarcas(); 
  }, []);

  const carregarMarcas = async () => {
    try {
      const res = await axios.get('/api/marcas');
      setMarcas(res.data);
    } catch (e) { 
        console.error("Erro ao buscar marcas:", e); 
    }
  };

  const adicionarMarca = async (e) => {
    e.preventDefault();
    if(!novaMarca) return; 

    setLoading(true);
    try {
      await axios.post('/api/marcas', { nome: novaMarca });
      setNovaMarca('');
      carregarMarcas();
    } catch (e) {
      alert("Atenção: " + (e.response?.data?.error || "Falha ao criar marca."));
    } finally { 
      setLoading(false); 
    }
  };

  const deletarMarca = async (id) => {
    if(!window.confirm("Tem certeza que deseja excluir esta marca?")) return;
    try {
      await axios.delete(`/api/marcas/${id}`);
      carregarMarcas();
    } catch (e) {
      alert("Não foi possível excluir: " + (e.response?.data?.error || "Erro desconhecido."));
    }
  };

  return (
    // Aplicando a variável de fundo e texto principal com transição suave
    <div className="min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-main)] font-sans p-6 overflow-hidden relative transition-colors duration-300">
       
       <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="relative z-10 container mx-auto max-w-2xl">
         
         <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate('/produtos')} className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:scale-105 transition-all">
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-bold">Gerenciar Marcas</h1>
         </div>

         {/* Aplicando a variável de glass-bg no cartão */}
         <div className="login-card p-6 rounded-3
