import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VanillaTilt from 'vanilla-tilt';
// NOVO: Importamos Sun e Moon para o botão de tema
import { Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const tiltRef = useRef(null); 
  
  const [formData, setFormData] = useState({ usuario: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  // NOVO ESTADO: Controla se o tema claro está ativo ou não
  const [isLightMode, setIsLightMode] = useState(false);

  // NOVO EFEITO: Aplica a mudança de tema na tag <html> da página
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 5,             
        speed: 400,         
        glare: true,        
        "max-glare": 0.1,   
        gyroscope: true,    
      });
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    tiltRef.current.style.setProperty('--mouse-x', `${x}px`);
    tiltRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await axios.post('/api/usuarios/login', formData);
      if (response.data.sucesso) {
        localStorage.setItem('usuario_tabela4', JSON.stringify(response.data.usuario));
        navigate('/produtos');
      }
    } catch (err) {
      setErro('Usuário ou senha incorretos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ATUALIZADO: bg-[var(--bg-color)] no lugar da cor fixa escura
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-color)] transition-colors duration-300">
      
      {/* NOVO: Botão flutuante para trocar o tema */}
      <button 
        onClick={() => setIsLightMode(!isLightMode)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] hover:scale-110 transition-transform shadow-lg"
        title="Alternar Tema"
      >
        {isLightMode ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div 
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        className="login-card w-[400px] p-10 rounded-3xl relative z-10"
      >
        <div className="relative z-20 flex flex-col items-center">
          
          {/* ATUALIZADO: text-[var(--text-main)] e text-[var(--text-muted)] */}
          <h1 className="text-4xl font-bold text-[var(--text-main)] mb-2 tracking-tight">Bem-vindo</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">Faça login para gerenciar a precificação.</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" size={20} />
              {/* ATUALIZADO: bg-[var(--input-bg)] e text-[var(--text-main)] */}
              <input 
                type="text" 
                placeholder="Usuário"
                value={formData.usuario}
                onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua Senha"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-12 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm text-[var(--text-muted)] mt-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[var(--text-main)] transition-colors">
                <input type="checkbox" className="rounded border-[var(--glass-border)] text-purple-500 focus:ring-0" />
                Lembrar-me
              </label>
              <a href="#" className="hover:text-[var(--text-main)] transition-colors">Esqueceu a senha?</a>
            </div>

            {erro && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pulse">
                 <span>⚠️</span> {erro}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Acessar Sistema"}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-[var(--glass-border)] w-full text-center">
             <p className="text-[var(--text-muted)] text-xs">Sistema de Precificação Inteligente</p>
             <p className="text-[var(--text-main)] text-sm font-medium mt-1">Feito por: Gabriel de Jesus</p>
          </div>

        </div>
      </div>
    </div>
  );
}
