import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VanillaTilt from 'vanilla-tilt'; // Biblioteca responsável pelo efeito 3D
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  
  // Referência direta ao elemento DOM do cartão (necessário para animações manuais)
  const tiltRef = useRef(null); 
  
  // Estados do Formulário
  const [formData, setFormData] = useState({ usuario: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // 1. Configuração do Efeito 3D (Tilt)
  // Inicializa a biblioteca assim que o componente é montado na tela.
  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 5,             // Inclinação máxima (graus). Baixo para ser elegante.
        speed: 400,         // Velocidade da transição.
        glare: true,        // Adiciona um reflexo de luz.
        "max-glare": 0.1,   // Opacidade do reflexo (bem suave).
        gyroscope: true,    // Funciona com movimento do celular também!
      });
    }
  }, []);

  // 2. Lógica do Spotlight (Luz Seguida)
  // Calcula onde o mouse está EM RELAÇÃO ao cartão, e não à tela inteira.
  // Injetamos essas coordenadas (X, Y) no CSS para mover o gradiente de luz.
  const handleMouseMove = (e) => {
    if (!tiltRef.current) return;
    
    const rect = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    tiltRef.current.style.setProperty('--mouse-x', `${x}px`);
    tiltRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // 3. Autenticação
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await axios.post('/api/usuarios/login', formData);
      
      if (response.data.sucesso) {
        // Salva a sessão do usuário no navegador para ele não precisar logar a cada F5
        localStorage.setItem('usuario_tabela4', JSON.stringify(response.data.usuario));
        
        // Redireciona para a área principal
        navigate('/produtos');
      }
    } catch (err) {
      setErro('Usuário ou senha incorretos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // CONTAINER: Fundo escuro com centralização total
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0f1014]">
      
      {/* AMBIENTAÇÃO: Orbs de luz no fundo para dar profundidade */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* O CARTÃO PRINCIPAL */}
      <div 
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        className="login-card w-[400px] p-10 rounded-3xl relative z-10"
      >
        {/* Camada de conteúdo (texto e inputs) */}
        <div className="relative z-20 flex flex-col items-center">
          
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Bem-vindo</h1>
          <p className="text-gray-400 text-sm mb-8">Faça login para gerenciar a precificação.</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            
            {/* Campo Usuário */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Usuário"
                value={formData.usuario}
                onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                className="w-full bg-[#00000040] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
              />
            </div>

            {/* Campo Senha */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua Senha"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full bg-[#00000040] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
              />
              {/* Botão de Olho (Mostrar/Esconder Senha) */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Opções Extras (Visual) */}
            <div className="flex justify-between items-center text-sm text-gray-400 mt-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="rounded bg-white/10 border-white/10 text-purple-500 focus:ring-0" />
                Lembrar-me
              </label>
              <a href="#" className="hover:text-white transition-colors">Esqueceu a senha?</a>
            </div>

            {/* Feedback de Erro */}
            {erro && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pulse">
                 <span>⚠️</span> {erro}
              </div>
            )}

            {/* Botão de Ação */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Acessar Sistema"}
            </button>

          </form>

          {/* Rodapé e Créditos */}
          <div className="mt-8 pt-6 border-t border-white/5 w-full text-center">
             <p className="text-gray-600 text-xs">Sistema de Precificação Inteligente</p>
             <p className="text-gray-500 text-sm font-medium mt-1">Feito por: Gabriel de Jesus</p>
          </div>

        </div>
      </div>
    </div>
  );
}