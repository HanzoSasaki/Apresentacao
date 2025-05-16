// ========================
// CONFIGURAÇÕES GLOBAIS
// ========================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2wJ-dp1WR6wJyvo_vN8CF_aK-sMsVEFEjupyPYBMfDLM5y2GF0HGIKD2vxzQRiiR9zhcelfl74XPJ/pub?gid=52812241&single=true&output=tsv';

const COLUNAS = {
  DATA:           'DATA',
  LIQ_SHOPEE:     'SHOPEE LÍQ.',
  BRUTO_SHOPEE:   'SHOPEE BRUTO',
  LIQ_ML:         'ML LÍQ.',
  BRUTO_ML:       'ML BRUTO',
  LIQ_AMAZON:     'AMAZON LÍQ.',
  BRUTO_AMAZON:   'AMAZON BRUTO',
  TOTAL_BRUTO:    'TOTAL BRUTO',
  TOTAL_LIQUIDO:  'TOTAL LÍQ.',
  CUSTO:          'CUSTO',
  PAGOS:          'PAGOS'
};

let todosDados = [];
let flatpickrInstance = null;

// ========================
// INICIALIZAÇÃO
// ========================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await carregarDados();
    configurarFlatpickr();
    const hoje = new Date();
    aplicarFiltro(hoje, hoje);
  } catch (err) {
    console.error('Erro na inicialização:', err);
    alert('Não foi possível carregar os dados.');
  }
});

// ========================
// FUNÇÃO: carregarDados
// ========================
async function carregarDados() {
  mostrarCarregando();
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const tsv = await response.text();
    const parsed = await new Promise((res, rej) => {
      Papa.parse(tsv, {
        delimiter: '\t',
        header: true,
        skipEmptyLines: true,
        complete: r => res(r.data),
        error: e => rej(e)
      });
    });
    todosDados = parsed.map(processarLinha).filter(d => d);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    alert('Não foi possível carregar os dados.');
  } finally {
    esconderCarregando();
  }
}

function mostrarCarregando() {
  document.getElementById('loading').style.display = 'flex';
}

function esconderCarregando() {
  document.getElementById('loading').style.display = 'none';
}

// ========================
// FUNÇÃO: processarLinha
// ========================
function processarLinha(linha) {
  const raw = linha[COLUNAS.DATA];
  if (!raw) return null;
  const [d, m, y] = raw.split(/[-/]/).map(Number);
  const dataObj = new Date(y, m - 1, d);
  if (isNaN(dataObj)) return null;
  const parseBRL = s => parseFloat(
    s?.replace('R$', '')
     .replace(/\s/g, '')
     .replace(/\./g, '')
     .replace(',', '.')
  ) || 0;

  return {
    data: dataObj,
    liqShopee:   parseBRL(linha[COLUNAS.LIQ_SHOPEE]),
    brutoShopee: parseBRL(linha[COLUNAS.BRUTO_SHOPEE]),
    liqMl:       parseBRL(linha[COLUNAS.LIQ_ML]),
    brutoMl:     parseBRL(linha[COLUNAS.BRUTO_ML]),
    liqAmazon:   parseBRL(linha[COLUNAS.LIQ_AMAZON]),
    brutoAmazon: parseBRL(linha[COLUNAS.BRUTO_AMAZON]),
    totalBruto:  parseBRL(linha[COLUNAS.TOTAL_BRUTO]),
    totalLiquido:parseBRL(linha[COLUNAS.TOTAL_LIQUIDO]),
    custo:       parseBRL(linha[COLUNAS.CUSTO]),
    pagos:       parseBRL(linha[COLUNAS.PAGOS])
  };
}

// ========================
// FUNÇÃO: configurarFlatpickr
// ========================
function configurarFlatpickr() {
  flatpickrInstance = flatpickr('#datePicker', {
    mode: 'range',
    dateFormat: 'd/m/Y',
    locale: 'pt',
    onChange: dates => dates.length === 2 && aplicarFiltro(dates[0], dates[1])
  });
}

// ========================
// FUNÇÃO: aplicarFiltro
// ========================
function aplicarFiltro(dataInicio, dataFim) {
  const inicio = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
  const fim = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59, 999);
  const filtrados = todosDados.filter(item => item.data >= inicio && item.data <= fim);
  atualizarUI(filtrados);
  atualizarResumoPeriodo(inicio, fim);
}

// ========================
// ATUALIZAÇÃO DA UI
// ========================
function atualizarUI(dados) {
  atualizarCards(dados);
  atualizarTabela(dados);
  atualizarResumoFinanceiro(dados);
}

function atualizarCards(dados) {
  const soma = dados.reduce((a, i) => ({
    liqShopee:   a.liqShopee + i.liqShopee,
    brutoShopee: a.brutoShopee + i.brutoShopee,
    liqMl:       a.liqMl + i.liqMl,
    brutoMl:     a.brutoMl + i.brutoMl,
    liqAmazon:   a.liqAmazon + i.liqAmazon,
    brutoAmazon: a.brutoAmazon + i.brutoAmazon
  }), {liqShopee: 0, brutoShopee: 0, liqMl: 0, brutoMl: 0, liqAmazon: 0, brutoAmazon: 0});

  document.getElementById('cards').innerHTML = `
    <div class="card"><h3>Shopee</h3>
      <p>Líquido: ${formatarMoeda(soma.liqShopee)}</p>
      <p>Bruto: ${formatarMoeda(soma.brutoShopee)}</p>
    </div>
    <div class="card"><h3>ML</h3>
      <p>Líquido: ${formatarMoeda(soma.liqMl)}</p>
      <p>Bruto: ${formatarMoeda(soma.brutoMl)}</p>
    </div>
    <div class="card"><h3>Amazon</h3>
      <p>Líquido: ${formatarMoeda(soma.liqAmazon)}</p>
      <p>Bruto: ${formatarMoeda(soma.brutoAmazon)}</p>
    </div>`;
}

function atualizarTabela(dados) {
  const rows = dados.map(i => `<tr>
    <td>${i.data.toLocaleDateString('pt-BR')}</td>
    <td>${formatarMoeda(i.liqShopee)}</td>
    <td>${formatarMoeda(i.brutoShopee)}</td>
    <td>${formatarMoeda(i.liqMl)}</td>
    <td>${formatarMoeda(i.brutoMl)}</td>
    <td>${formatarMoeda(i.liqAmazon)}</td>
    <td>${formatarMoeda(i.brutoAmazon)}</td>
    <td>${formatarMoeda(i.custo)}</td>
    <td>${formatarMoeda(i.pagos)}</td>
  </tr>`).join('');

  document.getElementById('dataTable').innerHTML = `
    <thead><tr>
      <th>Data</th>
      <th>Shopee Líq.</th><th>Shopee Bruto</th>
      <th>ML Líq.</th><th>ML Bruto</th>
      <th>Amazon Líq.</th><th>Amazon Bruto</th>
      <th>Custo</th><th>Pagos</th>
    </tr></thead><tbody>${rows}</tbody>`;
}

function atualizarResumoFinanceiro(dados) {
  const totalBruto = dados.reduce((s, i) => s + i.totalBruto, 0);
  const totalLiquido = dados.reduce((s, i) => s + i.totalLiquido, 0);
  const totalCusto = dados.reduce((s, i) => s + i.custo, 0);
  const resultado = totalBruto - totalCusto;
  const classe = resultado >= 0 ? 'profit' : 'loss';
  const texto = resultado >= 0 ? 'Lucro' : 'Prejuízo';

  document.getElementById('profitLoss').innerHTML = `
    <div class="card">
      <h3>Resumo Financeiro</h3>
      <p>Total Bruto: ${formatarMoeda(totalBruto)}</p>
      <p>Total Líquido: ${formatarMoeda(totalLiquido)}</p>
      <p>Total Custo: ${formatarMoeda(totalCusto)}</p>
      <p class="${classe}">Resultado: ${formatarMoeda(Math.abs(resultado))} (${texto})</p>
    </div>`;
}

function atualizarResumoPeriodo(inicio, fim) {
  const fmt = d => d.toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' });
  const texto = inicio.getTime() === fim.getTime()
    ? `Dia ${fmt(inicio)}`
    : `Período ${fmt(inicio)} – ${fmt(fim)}`;
  document.getElementById('selectedRange').textContent = texto;
}

function formatarMoeda(v) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
}

// Adiciona classes baseadas nos valores negativo/positivo
setTimeout(() => {
  document.querySelectorAll('td:nth-child(n+2)').forEach(cell => {
    const value = parseFloat(cell.innerText.replace('R$', '').replace(/\s/g, '').replace(',', '.'));
    cell.classList.add(value < 0 ? 'negative' : 'positive');
  });
}, 0);
