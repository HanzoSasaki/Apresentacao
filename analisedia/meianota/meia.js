let resultados = [];
let dadosFixos = []; // Armazena os dados da planilha

function openModal(modalId) {
  document.getElementById('modal' + modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById('modal' + modalId).style.display = "none";
}

// Fechar o modal clicando fora da área do conteúdo
window.onclick = function(event) {
  if (event.target.className === "modal") {
    event.target.style.display = "none";
  }
}

// Função para mostrar o loader
function mostrarLoader() {
  const loader = document.getElementById('loader');
  loader.style.visibility = 'visible';
  loader.style.opacity = '1';
}

// Função para ocultar o loader
function ocultarLoader() {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.visibility = 'hidden';
  }, 500);
}

// Função auxiliar para converter "DD/MM/AAAA" para um número (AAAAMMDD)
function converterParaNumero(data) {
  let [dia, mes, ano] = data.split("/");
  return parseInt(ano + mes + dia);
}

// Função para encontrar a última data disponível
function obterUltimaData(resultados) {
  let ultimaData = "";
  let maiorNumero = 0;
  resultados.forEach(item => {
    const dataItem = item[13];
    if (dataItem && typeof dataItem === "string" && dataItem.includes("/")) {
      const dataNum = converterParaNumero(dataItem);
      if (dataNum > maiorNumero) {
        maiorNumero = dataNum;
        ultimaData = dataItem;
      }
    }
  });
  return ultimaData;
}

// Função para carregar a planilha fixa
function carregarPlanilha() {
  mostrarLoader();

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSTFtzGJoM_SkG8ZobHrFdil3nZyZI9zKrPi6-5wDV27-wfly_oAgAcCSq1ylGg55giINmCpCMrMvQC/pub?output=csv')
    .then(response => response.text())
    .then(data => {
      Papa.parse(data, {
        complete: function (result) {
          resultados = result.data;
          resultados = resultados.slice(1).filter(row => row.length > 1);
          dadosFixos = resultados.map(row => [...row]);

          calcularMargens(resultados);
          calcularMargemTotalEMedia(resultados);

          const ultimaData = obterUltimaData(resultados);
          const resultadosUltimoDia = resultados.filter(item => item[13] === ultimaData);
          exibirResultados(resultadosUltimoDia);

          ocultarLoader();
        },
        header: false,
        skipEmptyLines: true
      });
    })
    .catch(error => {
      console.error("Erro ao carregar a planilha:", error);
      ocultarLoader();
    });
}

function calcularMargens(resultados) {
  resultados.forEach(item => {
    let custo = parseFloat(item[3].replace('R$', '').replace(',', '.')) || 0;
    let precoVenda = parseFloat(item[4].replace('R$', '').replace(',', '.')) || 0;
    const imposto = parseFloat(item[5].replace('%', '').replace(',', '.')) / 100 || 0;
    const comissao = parseFloat(item[6].replace('%', '').replace(',', '.')) / 100 || 0;
    let taxaPedidos = parseFloat(item[7].replace('R$', '').replace(',', '.')) || 0;

    const impostoValor = imposto * precoVenda;
    const comissaoValor = comissao * precoVenda;
    const totalDespesas = impostoValor + comissaoValor + taxaPedidos;

    const margemLiquida = precoVenda - custo - totalDespesas;
    const margemPercentual = (margemLiquida / precoVenda) * 100;

    item.margemLiquida = isNaN(margemLiquida) ? 0 : margemLiquida;
    item.margemPercentual = isNaN(margemPercentual) ? 0 : margemPercentual;
  });
}

function calcularMargemTotalEMedia(resultados) {
  const margensLiquidas = resultados.map(item => item.margemLiquida);
  const margemLiquidaTotal = margensLiquidas.reduce((total, margem) => total + margem, 0);
  const mediaMargemTotal = margemLiquidaTotal / margensLiquidas.length;

  const margemTotalEl = document.getElementById('margemLiquidaTotal');
  const mediaTotalEl = document.getElementById('mediaMargemTotal');

  if (margemTotalEl) {
    margemTotalEl.innerText = `Margem Líquida Total: R$ ${margemLiquidaTotal.toFixed(2)}`;
  }
  if (mediaTotalEl) {
    mediaTotalEl.innerText = `Média da Margem Total: ${(mediaMargemTotal).toFixed(2)}%`;
  }
}

function exibirResultados(resultados) {
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  resultados.forEach(item => {
    const margemLiquida = parseFloat(item[11].replace('R$', '').replace(',', '.')) || 0;
    const margemPercentual = parseFloat(item[12].replace('%', '').replace(',', '.')) || 0;
    const porcentagemColuna14 = parseFloat(item[14].replace('%', '').replace(',', '.')) || 0;

    const corMargemLiquida = margemLiquida < 0 ? 'color: red;' : 'color: green;';
    const corMargemPercentual = margemPercentual < 0 ? 'color: red; font-weight: bold;' : 'color: green; font-weight: bold;';
    const corManterAlterar = item[16].toLowerCase() === 'alterar' ? 'color: red; font-weight: bold;' : (item[16].toLowerCase() === 'manter' ? 'color: green; font-weight: bold;' : '');
    const corColuna14 = porcentagemColuna14 > 0 ? 'color: red; font-weight: bold;' : '';
    const corFundoLinha = item[16].toLowerCase() === 'alterar' ? 'background-color: #FFDDDD;' : 
                         (item[16].toLowerCase() === 'manter' ? 'background-color: #DFFFD6;' : '');

    const row = document.createElement('tr');
    row.style = corFundoLinha;
    row.innerHTML = `
      <td>${item[0]}</td>
      <td>${item[1]}</td>
      <td>${item[2]}</td>
      <td>${item[17]}</td>
      <td>${item[10]}</td>
      <td>${item[4]}</td>
      <td>${item[5]}</td>
      <td style="${corMargemPercentual}">${item[11]}</td>
      <td style="${corMargemPercentual}">${item[12]}</td>
      <td>${item[13]}</td>
      <td style="${corColuna14}">${item[14]}</td>
      <td style="${corManterAlterar}">${item[16]}</td>
      <td style="font-weight: bold;">${item[18]}</td>
    `;
    tbody.appendChild(row);
  });
}

document.querySelectorAll('.copy-link').forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = this.textContent;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Texto copiado para a área de transferência!');
  });
});

// Filtro por texto
function filtrarDados(filtro) {
  const resultadosFiltrados = dadosFixos.filter(item => {
    return item.some(valor => valor.toString().toLowerCase().includes(filtro.toLowerCase()));
  });
  exibirResultados(resultadosFiltrados);
}

function filtrar() {
  const filtro = document.getElementById('busca').value;
  filtrarDados(filtro);
}

// Botão de rolagem
window.onscroll = function() {
  let scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

carregarPlanilha();
