// client/src/utils/calculosFiscais.js

// Taxas fixas do mercado e do governo.
// Alterar aqui reflete automaticamente em todos os cálculos do sistema.
const CONSTANTES_FISCAIS = {
    PIS_COFINS: 9.25 / 100, // Alíquota padrão para regime não-cumulativo (Lucro Real)
    TAXA_CLASSICO: 11.5 / 100, // Comissão do Mercado Livre (Clássico)
    TAXA_PREMIUM: 16.5 / 100   // Comissão do Mercado Livre (Premium)
};

export function calcularPrecificacao(dados) {
    // 1. Normalização dos Dados
    // Garantimos que todos os inputs sejam números válidos.
    // Também convertemos porcentagens inteiras (ex: 18) para decimais (0.18) para o cálculo matemático.
    const custo = Number(dados.custo) || 0;
    const icmsEntPct = (Number(dados.icms_entrada) || 0) / 100; 
    const icmsSaiPct = (Number(dados.icms_saida) || 0) / 100;
    const ipiPct = (Number(dados.ipi) || 0) / 100;
    const difalPct = (Number(dados.difal) || 0) / 100;
    const freteML = Number(dados.frete_ml) || 0;
    
    // Tratamento especial para Simulação de ST:
    // Se a flag estiver ativa, ignoramos o ST real para simular um cenário sem esse custo.
    const stPct = dados.flag_simulacao_st ? 0.0 : ((Number(dados.st) || 0) / 100);

    // 2. Apuração dos Créditos (Entrada)
    // No Lucro Real, o imposto pago na compra vira crédito para abater na venda.
    const valorICMSEnt = custo * icmsEntPct;
    const valorIPI = custo * ipiPct;
    const valorST = custo * stPct;

    // A base de cálculo do crédito de PIS/COFINS exclui o ICMS mas inclui o IPI
    const basePisCofinsEnt = custo - valorICMSEnt + valorIPI;
    const creditoPisCofins = basePisCofinsEnt * CONSTANTES_FISCAIS.PIS_COFINS;

    // Custo Líquido: É o custo real da mercadoria após descontar os créditos que recuperamos
    const valorLiquido = custo - valorICMSEnt - creditoPisCofins + valorIPI + valorST;

    // 3. Função Auxiliar de Cenários (Saída)
    // Calcula o resultado final baseando-se no preço de venda e na taxa do anúncio (Clássico ou Premium)
    const calcularCenario = (precoVenda, taxaPct) => {
        const preco = Number(precoVenda) || 0;
        
        // Custos de Venda
        const taxaML = preco * taxaPct;
        const valorICMSSai = preco * icmsSaiPct; 
        
        // Débitos fiscais na venda
        const basePisCofinsSai = preco - valorICMSSai;
        const debitoPisCofins = basePisCofinsSai * CONSTANTES_FISCAIS.PIS_COFINS;
        const valorDifal = preco * difalPct;

        // Custo Total da Operação (Produto + Impostos de Venda + Taxas + Frete)
        const custoTotal = valorLiquido + freteML + taxaML + debitoPisCofins + valorICMSSai + valorDifal;
        
        // Margem de Lucro Real (%)
        const margem = preco > 0 ? ((preco - custoTotal) / preco) * 100 : 0;

        return { taxaML, valorICMSSai, debitoPisCofins, valorDifal, custoTotal, margem };
    };

    // Retorno estruturado para alimentar a interface
    return {
        custoBase: { valorICMSEnt, valorIPI, valorST, creditoPisCofins, valorLiquido },
        classico: calcularCenario(dados.preco_classico, CONSTANTES_FISCAIS.TAXA_CLASSICO),
        premium: calcularCenario(dados.preco_premium, CONSTANTES_FISCAIS.TAXA_PREMIUM)
    };
}