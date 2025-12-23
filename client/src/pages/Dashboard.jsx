import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ArrowLeft, TrendingUp, Package, AlertCircle, DollarSign } from 'lucide-react';
import { calcularPrecificacao } from '../utils/calculosFiscais';

// Inicialização da biblioteca de gráficos (Chart.js)
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // 1. Camada de Dados
  // Mantemos os dados "crus" vindos do banco separados das estatísticas.
  // Isso permite recalcular os números sem precisar fazer novas requisições à API.
  const [produtos, setProdutos] = useState([]);
  
  // 2. Estado de Simulação
  // Controla se os cálculos devem considerar o ressarcimento de ST ou não.
  const [simularST, setSimularST] = useState(false);

  // 3. Indicadores de Performance (KPIs)
  const [stats, setStats] = useState({
    totalProdutos: 0,
    ticketMedioClassico: 0,
    ticketMedioPremium: 0,
    classico: { lucro: 0, prejuizo: 0 },
    premium: { lucro: 0, prejuizo: 0 }
  });

  // Ciclo de Vida 1: Carregamento Inicial
  useEffect(() => {
    carregarDados();
  }, []);

  // Ciclo de Vida 2: Reatividade Inteligente
  // Toda vez que a lista de produtos muda OU o usuário clica no botão de Simulação ST,
  // esta função roda automaticamente para atualizar os gráficos e números.
  useEffect(() => {
    if (produtos.length > 0) {
        processarAnalytics(produtos);
    }
  }, [produtos, simularST]);

  const carregarDados = async () => {
    try {
      const res = await axios.get('/api/produtos');
      setProdutos(res.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Motor de Processamento
  // Percorre todos os produtos e aplica a mesma matemática fiscal usada no formulário.
  const processarAnalytics = (listaProdutos) => {
    let totalClassico = 0;
    let totalPremium = 0;
    let countLucroClass = 0;
    let countPrejClass = 0;
    let countLucroPrem = 0;
    let countPrejPrem = 0;

    listaProdutos.forEach(prod => {
      // Reutilizamos a função central de cálculo para garantir consistência
      // Passamos a flag 'simularST' para ver o cenário "E se?"
      const resultado = calcularPrecificacao({ ...prod, flag_simulacao_st: simularST });

      // Acumula valores para médias
      totalClassico += Number(prod.preco_classico || 0);
      totalPremium += Number(prod.preco_premium || 0);

      // Classificação: Lucro vs Prejuízo
      if (resultado.classico.margem >= 0) countLucroClass++; else countPrejClass++;
      if (resultado.premium.margem >= 0) countLucroPrem++; else countPrejPrem++;
    });

    setStats({
      totalProdutos: listaProdutos.length,
      ticketMedioClassico: listaProdutos.length ? totalClassico / listaProdutos.length : 0,
      ticketMedioPremium: listaProdutos.length ? totalPremium / listaProdutos.length : 0,
      classico: { lucro: countLucroClass, prejuizo: countPrejClass },
      premium: { lucro: countLucroPrem, prejuizo: countPrejPrem }
    });
  };

  // Configuração visual dos gráficos de Rosca (Doughnut)
  const criarDadosGrafico = (lucro, prejuizo) => ({
    labels: ['Lucrativos', 'Prejuízo'],
    datasets: [
      {
        data: [lucro, prejuizo],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'], // Verde e Vermelho
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  });

  const options = {
    plugins: {
        legend: { labels: { color: 'white' } } // Ajuste para fundo escuro
    }
  };

  // Formatador de Moeda (R$)
  const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Carregando Analytics...</div>;

  return (
    <div className="min-h-screen w-full bg-[#0f1014] text-white font-sans p-6 overflow-hidden relative">
       
       {/* Elementos de Fundo (Ambientação) */}
       <div className="fixed top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="relative z-10 container mx-auto max-w-6xl">
          
          {/* Cabeçalho e Controles */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={() => navigate('/produtos')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors" title="Voltar para Lista">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Dashboard de Performance</h1>
                    <p className="text-gray-400 text-sm">Raio-X financeiro do seu mix de produtos.</p>
                </div>
            </div>

            {/* Controle de Cenário (Toggle ST) */}
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
          </div>

          {/* Cards de KPIs (Indicadores Chave) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Volume */}
              <div className="login-card p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Package size={24} />
                  </div>
                  <div>
                      <p className="text-gray-400 text-sm">Total de SKUs</p>
                      <h2 className="text-3xl font-bold text-white">{stats.totalProdutos}</h2>
                  </div>
              </div>

              {/* Card 2: Ticket Médio Clássico */}
              <div className="login-card p-6 rounded-3xl bg-white/[0.02] border border-blue-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <DollarSign size={24} />
                  </div>
                  <div>
                      <p className="text-gray-400 text-sm">Ticket Médio (Clássico)</p>
                      <h2 className="text-3xl font-bold text-blue-400">{fmt(stats.ticketMedioClassico)}</h2>
                  </div>
              </div>

              {/* Card 3: Ticket Médio Premium */}
              <div className="login-card p-6 rounded-3xl bg-white/[0.02] border border-purple-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <TrendingUp size={24} />
                  </div>
                  <div>
                      <p className="text-gray-400 text-sm">Ticket Médio (Premium)</p>
                      <h2 className="text-3xl font-bold text-purple-400">{fmt(stats.ticketMedioPremium)}</h2>
                  </div>
              </div>
          </div>

          {/* Área Gráfica: Rentabilidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gráfico Clássico */}
              <div className="login-card p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-center">
                  <h3 className="text-lg font-bold mb-6 text-blue-300">Rentabilidade ML Clássico</h3>
                  <div className="w-64 h-64 relative">
                      <Doughnut data={criarDadosGrafico(stats.classico.lucro, stats.classico.prejuizo)} options={options} />
                  </div>
                  <div className="mt-6 flex gap-6 text-sm">
                      <div className="flex items-center gap-2 text-green-400 font-bold">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          {stats.classico.lucro} Lucro
                      </div>
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          {stats.classico.prejuizo} Prejuízo
                      </div>
                  </div>
              </div>

              {/* Gráfico Premium */}
              <div className="login-card p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-center">
                  <h3 className="text-lg font-bold mb-6 text-purple-300">Rentabilidade ML Premium</h3>
                  <div className="w-64 h-64 relative">
                      <Doughnut data={criarDadosGrafico(stats.premium.lucro, stats.premium.prejuizo)} options={options} />
                  </div>
                  <div className="mt-6 flex gap-6 text-sm">
                      <div className="flex items-center gap-2 text-green-400 font-bold">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          {stats.premium.lucro} Lucro
                      </div>
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          {stats.premium.prejuizo} Prejuízo
                      </div>
                  </div>
              </div>
          </div>

          {/* Alerta Inteligente */}
          {(stats.classico.prejuizo > 0 || stats.premium.prejuizo > 0) && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-300 animate-pulse">
                  <AlertCircle size={24} />
                  <p>Atenção: Identificamos produtos com margem negativa no seu mix. Experimente ativar o "ST Ressarcido" para ver se o cenário melhora.</p>
              </div>
          )}
       </div>
    </div>
  );
}