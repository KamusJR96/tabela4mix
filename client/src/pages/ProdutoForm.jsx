import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Search, Truck, DollarSign, Percent, Calculator } from 'lucide-react';
import InputGlass from '../components/InputGlass'; 
import { calcularPrecificacao } from '../utils/calculosFiscais'; 

export default function ProdutoForm() {
  const { sku } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState([]);

  const [form, setForm] = useState({
    sku: '', nome: '', marca_id: '',
    custo: 0, frete_ml: 0,
    icms_entrada: 0, 
    icms_saida: 0,   
    st: 0, ipi: 0, difal: 0,
    preco_classico: 0, preco_premium: 0,
    preco_conc_classico: 0, preco_conc_premium: 0,
    flag_simulacao_st: false 
  });

  const [resultados, setResultados] = useState({
    classico: { margem: 0, custoTotal: 0, detalhamento: {} },
    premium: { margem: 0, custoTotal: 0, detalhamento: {} },
    custoBase: {}
  });

  useEffect(() => {
    carregarMarcas();
    if (sku) carregarProduto();
  }, [sku]);

  useEffect(() => {
    const res = calcularPrecificacao(form);
    setResultados(res);
  }, [form]);

  const carregarMarcas = async () => {
    try {
      const res = await axios.get('/api/marcas');
      setMarcas(res.data);
    } catch (e) { console.error("Erro ao buscar marcas.", e); }
  };

  const carregarProduto = async () => {
    try {
      const res = await axios.get(`/api/produtos/${sku}`);
      setForm(prev => ({ ...prev, ...res.data, flag_simulacao_st: false }));
    } catch (e) { alert("Erro ao carregar dados do produto."); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleST = () => {
    setForm(prev => ({ ...prev, flag_simulacao_st: !prev.flag_simulacao_st }));
  };

  const pesquisarML = () => {
    if (!form.nome) return alert("Digite um nome para pesquisar.");
    window.open(`https://lista.mercadolivre.com.br/${encodeURIComponent(form.nome)}`, '_blank');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = sku ? `/api/produtos/${sku}` : '/api/produtos';
      const method = sku ? 'put' : 'post';
      await axios[method](url, form);
      navigate('/produtos');
    } catch (e) { 
        alert("Erro ao salvar: " + (e.response?.data?.error || e.message)); 
    } finally { 
        setLoading(false); 
    }
  };

  const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

  const DetalhamentoCusto = ({ res, cenario }) => (
    // border-[var(--glass-border)] no lugar da borda fixa
    <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[var(--glass-border)]">
        
        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">ICMS Ent (Créd)</div>
            <div className="text-xs font-bold text-green-500">{fmt(resultados.custoBase?.valorICMSEnt)}</div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">ST {form.flag_simulacao_st ? '(Isento)' : ''}</div>
            <div className={`text-xs font-bold ${form.flag_simulacao_st ? 'text-[var(--text-muted)] line-through' : 'text-red-500'}`}>
                {fmt(resultados.custoBase?.valorST)}
            </div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">IPI</div>
            <div className="text-xs font-bold text-red-500">{fmt(resultados.custoBase?.valorIPI)}</div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">PIS/COF (Créd)</div>
            <div className="text-xs font-bold text-green-500">{fmt(resultados.custoBase?.creditoPisCofins)}</div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">ICMS Saída</div>
            <div className="text-xs font-bold text-red-500">{fmt(res?.valorICMSSai)}</div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">PIS/COF (Déb)</div>
            <div className="text-xs font-bold text-red-500">{fmt(res?.debitoPisCofins)}</div>
        </div>

        <div className="text-center p-2 rounded bg-[var(--glass-bg)] flex flex-col justify-center h-16 border border-[var(--glass-border)]">
            <div className="text-[10px] text-[var(--text-muted)]">DIFAL</div>
            <div className="text-xs font-bold text-red-500">{fmt(res?.valorDifal)}</div>
        </div>

        <div className="text-center p-2 rounded bg-yellow-500/10 border border-yellow-500/20 flex flex-col justify-center h-16">
            <div className="text-[10px] text-yellow-600">Taxa ML ({cenario === 'classico' ? '11.5%' : '16.5%'})</div>
            <div className="text-xs font-bold text-yellow-500">{fmt(res?.taxaML)}</div>
        </div>

    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-main)] font-sans pb-20 relative overflow-x-hidden transition-colors duration-300">
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto p-6 max-w-6xl">
        
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/produtos')} className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:scale-105 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">{sku ? 'Editar Produto' : 'Novo Cadastro'}</h1>
        </div>

        {JSON.parse(localStorage.getItem('usuario_tabela4') || '{}').cargo === 'visita' && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3 text-yellow-600">
                <Calculator size={24} />
                <div>
                    <h4 className="font-bold text-sm">Modo Simulação Ativo</h4>
                    <p className="text-xs opacity-80">Você pode testar preços livremente. As alterações não serão salvas.</p>
                </div>
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          <section className="login-card p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4 border-b border-[var(--glass-border)] pb-2">Dados Cadastrais</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                    <InputGlass label="SKU" name="sku" value={form.sku} onChange={handleChange} disabled={!!sku} required />
                </div>
                <div className="md:col-span-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Marca</label>
                        <select 
                            name="marca_id" value={form.marca_id} onChange={handleChange}
                            className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:border-purple-500/50 appearance-none transition-colors"
                        >
                            <option value="">Selecione...</option>
                            {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                        </select>
                    </div>
                </div>
                <div className="md:col-span-7">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Descrição / Nome</label>
                    <div className="relative flex gap-2">
                        <input 
                           name="nome" value={form.nome} onChange={handleChange} required
                           className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                        <button type="button" onClick={pesquisarML} className="bg-[#ffe600] text-black font-bold px-4 rounded-xl hover:brightness-90 transition-all flex items-center gap-2 text-sm">
                            <Search size={16}/> Buscar no ML
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <section className="login-card p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[var(--glass-border)] pb-2 gap-4">
                 <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase">Custo e Tributação (%)</h3>
                 
                 <div 
                    onClick={toggleST}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer border transition-all select-none
                        ${form.flag_simulacao_st 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'}`}
                 >
                    <span className={`text-xs font-bold ${form.flag_simulacao_st ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                        {form.flag_simulacao_st ? '⚡ Ressarcimento Ativo' : 'ST Padrão'}
                    </span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${form.flag_simulacao_st ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${form.flag_simulacao_st ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="col-span-1">
                    <InputGlass label="Custo Aquisição (R$)" name="custo" type="number" step="0.01" value={form.custo} onChange={handleChange} />
                </div>
                
                <InputGlass label="ICMS Ent. (%)" name="icms_entrada" type="number" step="0.01" value={form.icms_entrada} onChange={handleChange} icon={Percent} />
                
                <div className={form.flag_simulacao_st ? "opacity-40 grayscale transition-all" : "transition-all"}>
                    <InputGlass label="ST (%)" name="st" type="number" step="0.01" value={form.st} onChange={handleChange} icon={Percent} />
                </div>

                <InputGlass label="IPI (%)" name="ipi" type="number" step="0.01" value={form.ipi} onChange={handleChange} icon={Percent} />
                <InputGlass label="DIFAL (%)" name="difal" type="number" step="0.01" value={form.difal} onChange={handleChange} icon={Percent} />
                <InputGlass label="ICMS Saída (%)" name="icms_saida" type="number" step="0.01" value={form.icms_saida} onChange={handleChange} icon={Percent} />
             </div>
             
             <div className="mt-4 w-full md:w-1/4">
                <InputGlass label="Frete Mercado Livre (R$)" name="frete_ml" type="number" step="0.01" value={form.frete_ml} onChange={handleChange} icon={Truck} />
             </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Painel Clássico */}
             <section className="login-card p-6 rounded-3xl border border-blue-500/20 bg-[var(--glass-bg)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl text-white shadow-lg">CLÁSSICO</div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <InputGlass label="Seu Preço" name="preco_classico" type="number" step="0.01" value={form.preco_classico} onChange={handleChange} icon={DollarSign} />
                    <InputGlass label="Concorrente" name="preco_conc_classico" type="number" step="0.01" value={form.preco_conc_classico} onChange={handleChange} />
                </div>

                <div className="flex items-center justify-between bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--glass-border)]">
                    <div>
                        <div className="text-xs text-[var(--text-muted)]">Custo Total</div>
                        <div className="text-lg font-bold text-[var(--text-main)]">{fmt(resultados.classico.custoTotal)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Margem</div>
                        <div className={`text-2xl font-bold ${resultados.classico.margem >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {resultados.classico.margem.toFixed(2)}%
                        </div>
                    </div>
                </div>
                <DetalhamentoCusto res={resultados.classico} cenario="classico" />
             </section>

             {/* Painel Premium */}
             <section className="login-card p-6 rounded-3xl border border-purple-500/20 bg-[var(--glass-bg)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500 text-xs font-bold px-3 py-1 rounded-bl-xl text-white shadow-lg">PREMIUM</div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <InputGlass label="Seu Preço" name="preco_premium" type="number" step="0.01" value={form.preco_premium} onChange={handleChange} icon={DollarSign} />
                    <InputGlass label="Concorrente" name="preco_conc_premium" type="number" step="0.01" value={form.preco_conc_premium} onChange={handleChange} />
                </div>

                <div className="flex items-center justify-between bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--glass-border)]">
                    <div>
                        <div className="text-xs text-[var(--text-muted)]">Custo Total</div>
                        <div className="text-lg font-bold text-[var(--text-main)]">{fmt(resultados.premium.custoTotal)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Margem</div>
                        <div className={`text-2xl font-bold ${resultados.premium.margem >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {resultados.premium.margem.toFixed(2)}%
                        </div>
                    </div>
                </div>
                <DetalhamentoCusto res={resultados.premium} cenario="premium" />
             </section>
          </div>

          <div className="flex gap-4 pt-4">
             <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2">
                {loading ? 'Processando...' : <><Save size={20}/> Salvar Alterações</>}
             </button>
             <button type="button" onClick={() => navigate('/produtos')} className="px-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] rounded-2xl font-bold hover:scale-105 transition-all">
                Cancelar
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
