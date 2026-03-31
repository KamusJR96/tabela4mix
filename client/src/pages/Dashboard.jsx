import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ArrowLeft, TrendingUp, Package, AlertCircle, DollarSign } from 'lucide-react';
import { calcularPrecificacao } from '../utils/calculosFiscais';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [simularST, setSimularST] = useState(false);

  const [stats, setStats] = useState({
    totalProdutos: 0,
    ticketMedioClassico: 0,
    ticketMedioPremium: 0,
    classico: { lucro: 0, prejuizo: 0 },
    premium: { lucro: 0, prejuizo: 0 }
  });

  useEffect(() => {
    carregarDados();
  }, []);

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

  const processarAnalytics = (listaProdutos) => {
    let totalClassico = 0;
    let totalPremium = 0;
    let countLucroClass = 0;
    let countPrejClass = 0;
    let countLucroPrem = 0;
    let countPrejPrem = 0;

    listaProdutos.forEach(prod => {
      const resultado = calcularPrecificacao({ ...prod, flag_simulacao_st: simularST });

      totalClassico += Number(prod.preco_classico || 0);
      totalPremium += Number(prod.preco_premium || 0);

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

  const criarDadosGrafico = (lucro, prejuizo) => ({
    labels: ['Lucrativos', 'Prejuízo'],
    datasets: [
      {
        data: [lucro, prejuizo],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'], 
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  });

  // Ajuste: A cor da legenda do gráfico agora usa uma cor neutra para aparecer bem nos dois temas
  const options = {
    plugins: {
        legend: { labels: { color: '#a0a0a0' } } 
    }
  };

  const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Substituído: bg-[#0f1014] -> bg-[var(--bg-color)], text-white -> text-[var(--text-main)]
  if (loading) return <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-main)] transition-colors duration-300">Carregando Analytics...</div>;

  return (
    // Substituído: bg-[#0f1014] -> bg-[var(--bg-color)], text-white -> text-[var(--text-main)]
    <div className="min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-main)] font-sans p-6 overflow-hidden relative transition-colors duration-300">
       
       <div className="fixed top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="relative z-10 container mx-auto max-w-6xl">
         
         <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto">
               <button onClick={() => navigate('/produtos')} className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:scale-105 transition-all" title="Voltar para Lista">
                   <ArrowLeft size={20} />
               </button>
               <div>
                   <h1 className="text-2xl font-bold">Dashboard de Performance</h1>
                   <p className="text-[var(--text-muted)] text-sm">Raio-X financeiro do seu mix de produtos.</p>
               </div>
           </div>

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
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="login-card p-6 rounded-3xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                     <Package size={24} />
                 </div>
                 <div>
                     <p className="text-[var(--text-muted)] text-sm">Total de SKUs</p>
                     <h2 className="text-3xl font-bold text-[var(--text-main)]">{stats.totalProdutos}</h2>
                 </div>
             </div>

             <div className="login-card p-6 rounded-3xl border-blue-500/20 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                     <DollarSign size={24} />
                 </div>
                 <div>
                     <p className="text-[var(--text-muted)] text-sm">Ticket Médio (Clássico)</p>
                     <h2 className="text-3xl font-bold text-blue-500">{fmt(stats.ticketMedioClassico)}</h2>
                 </div>
             </div>

             <div className="login-card p-6 rounded-3xl border-purple-500/20 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                     <TrendingUp size={24} />
                 </div>
                 <div>
                     <p className="text-[var(--text-muted)] text-sm">Ticket Médio (Premium)</p>
                     <h2 className="text-3xl font-bold text-purple-500">{fmt(stats.ticketMedioPremium)}</h2>
                 </div>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="login-card p-8 rounded-3xl flex flex-col items-center">
                 <h3 className="text-lg font-bold mb-6 text-blue-500">Rentabilidade ML Clássico</h3>
                 <div className="w-64 h-64 relative">
                     <Doughnut data={criarDadosGrafico(stats.classico.lucro, stats.classico.prejuizo)} options={options} />
                 </div>
                 <div className="mt-6 flex gap-6 text-sm">
                     <div className="flex items-center gap-2 text-green-500 font-bold">
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                         {stats.classico.lucro} Lucro
                     </div>
                     <div className="flex items-center gap-2 text-red-500 font-bold">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         {stats.classico.prejuizo} Prejuízo
                     </div>
                 </div>
             </div>

             <div className="login-card p-8 rounded-3xl flex flex-col items-center">
                 <h3 className="text-lg font-bold mb-6 text-purple-500">Rentabilidade ML Premium</h3>
                 <div className="w-64 h-64 relative">
                     <Doughnut data={criarDadosGrafico(stats.premium.lucro, stats.premium.prejuizo)} options={options} />
                 </div>
                 <div className="mt-6 flex gap-6 text-sm">
                     <div className="flex items-center gap-2 text-green-500 font-bold">
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                         {stats.premium.lucro} Lucro
                     </div>
                     <div className="flex items-center gap-2 text-red-500 font-bold">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         {stats.premium.prejuizo} Prejuízo
                     </div>
                 </div>
             </div>
         </div>

         {(stats.classico.prejuizo > 0 || stats.premium.prejuizo > 0) && (
             <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-pulse">
                 <AlertCircle size={24} />
                 <p>Atenção: Identificamos produtos com margem negativa no seu mix. Experimente ativar o "ST Ressarcido" para ver se o cenário melhora.</p>
             </div>
         )}
       </div>
    </div>
  );
}
