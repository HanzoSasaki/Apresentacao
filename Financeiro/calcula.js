function abrirCalculadora(tipo) {
    let title = "";
    let content = "";
    switch (tipo) {
      case "venda":
        title = "Calculadora de Precificação Shopee";
        content = `
            <label for="custo">Custo do Produto (R$):</label>
            <input type="number" id="custo" placeholder="Digite o custo">
            
            <label for="imposto">Imposto (%):</label>
            <input type="number" id="imposto" placeholder="Digite o imposto">
            
            <label for="comissao">Comissão Marketplace (%):</label>
            <input type="number" id="comissao" placeholder="Digite a comissão">
            
            <label for="taxa">Taxa por Pedido (R$):</label>
            <input type="number" id="taxa" placeholder="Digite a taxa">
            
            <label for="margem">Margem de Lucro Desejada (%):</label>
            <input type="number" id="margem" placeholder="Digite a margem">
            
            <button onclick="calcularPreco()">Calcular Preço de Venda</button>
    
            <div id="resultado"></div>
            <div id="lucroShopee"></div>
            <div id="promocoes"></div>
        `;
        break;
    
        case "lucro":
            title = "Calculadora Tributária (ICMS e IPI)";
            content = `<label for="tipoNota">Tipo da Nota</label>
             <select id="tipoNota">
                 <option value="inteira">Nota Inteira</option>
                 <option value="meiaNota">Meia Nota</option>
                 <option value="nota3">Nota 1/3</option>
             </select>
             <label for="custo">Custo do Produto (R$):</label>
             <input type="number" id="custo" placeholder="Digite o valor do custo" required>
             <label for="icms">ICMS (%):</label>
             <input type="number" id="icms" placeholder="Digite a porcentagem de ICMS">
             <label for="ipi">IPI (%):</label>
             <input type="number" id="ipi" placeholder="Digite a porcentagem de IPI">
             <label for="porcentagem">Porcentagem Adicional (%)</label>
             <input type="number" id="porcentagem" step="0.01" placeholder="Digite a porcentagem adicional">
             <button onclick="calcularValorFinal()">Calcular</button>`;
            break;
        case "imposto":
            title = "Simulação de Promoção";
            content = `
             <label for="promo-custo">Preço de Custo (R$):</label>
             <input type="number" id="promo-custo" placeholder="Digite o preço de custo">
             <label for="promo-precoVenda">Preço de Venda (R$):</label>
             <input type="number" id="promo-precoVenda" placeholder="Digite o preço de venda">
             <button onclick="calcularPromocao()">Calcular Promoção</button>
             <div id="promo-result"></div>
            `;
            break;
    }
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = content;
    document.getElementById("resultado").innerText = "";
    // Em vez de alterar o display, adicionamos a classe "show" para ativar a animação
    document.getElementById("modal").classList.add("show");
  }
  
  function fecharModal() {
    // Remove a classe "show" para disparar a animação de fechamento
    document.getElementById("modal").classList.remove("show");
  }
  function calcularPreco() {
    let custo = parseFloat(document.getElementById("custo").value) || NaN;
    let imposto = parseFloat(document.getElementById("imposto").value) / 100 || NaN;
    let comissao = parseFloat(document.getElementById("comissao").value) / 100 || NaN;
    let taxa = parseFloat(document.getElementById("taxa").value) || NaN;
    let margem = parseFloat(document.getElementById("margem").value) / 100 || NaN;

    if (isNaN(custo) || isNaN(imposto) || isNaN(comissao) || isNaN(taxa) || isNaN(margem)) {
        alert("Por favor, preencha todos os campos para efetuar o cálculo.");
        return;
    }

    let precoVenda = (custo + taxa) / (1 - (imposto + comissao + margem));
    let custoTotal = custo + (precoVenda * imposto) + (precoVenda * comissao) + taxa;
    let lucro = precoVenda - custoTotal;
    let margemLucro = (lucro / precoVenda) * 100;

    let resultadoHTML = `
        <p><strong>Preço de Venda Sugerido:</strong> R$ ${precoVenda.toFixed(2)}</p>
        <p class="green"><strong>Lucro Líquido:</strong> R$ ${lucro.toFixed(2)} (${margemLucro.toFixed(2)}%)</p>
    `;

    document.getElementById("resultado").innerHTML = resultadoHTML;

    let promocoesHTML = `<h3>Promoções Possíveis:</h3><table>
        <thead>
            <tr>
                <th>Desconto (%)</th>
                <th>Preço com Desconto (R$)</th>
                <th>Lucro (R$)</th>
                <th>Margem Líquida (%)</th>
            </tr>
        </thead>
        <tbody>`;

    for (let desconto = 5; desconto <= 50; desconto += 5) {
        let precoComDesconto = precoVenda - (precoVenda * (desconto / 100));
        let custoTotalDesconto = custo + (precoComDesconto * imposto) + (precoComDesconto * comissao) + taxa;
        let lucroDesconto = precoComDesconto - custoTotalDesconto;
        let margemDesconto = (lucroDesconto / precoComDesconto) * 100;

        if (lucroDesconto > 0) {
            promocoesHTML += `<tr>
                <td>${desconto}%</td>
                <td>R$ ${precoComDesconto.toFixed(2)}</td>
                <td class="green">R$ ${lucroDesconto.toFixed(2)}</td>
                <td class="green">${margemDesconto.toFixed(2)}%</td>
            </tr>`;
        }
    }

    promocoesHTML += `</tbody></table>`;
    document.getElementById("promocoes").innerHTML = promocoesHTML;
}

  
  function calcularValorFinal() {
    const custo = parseFloat(document.getElementById("custo").value);
    const icms = parseFloat(document.getElementById("icms").value);
    const ipi = parseFloat(document.getElementById("ipi").value);
    const tipoNota = document.getElementById("tipoNota").value;
    const porcentagemAdicional = parseFloat(document.getElementById("porcentagem").value);
  
    // Verificação de campos vazios
    if (
        isNaN(custo) ||
        isNaN(icms) ||
        isNaN(ipi) ||
        isNaN(porcentagemAdicional)
    ) {
        alert("Por favor, preencha todos os campos para efetuar o cálculo.");
        return;
    }
  
    let valorFinal;
    if (icms === 18 && ipi === 0) {
        valorFinal = custo;
    } else if (icms === 18) {
        valorFinal = custo + (custo * ipi) / 100;
    } else {
        const diferencaICMS = 18 - icms;
        valorFinal =
            custo +
            (custo * diferencaICMS) / 100 +
            (custo * ipi) / 100;
    }
  
    // Condições baseadas no tipo da nota
    if (tipoNota === "meiaNota") {
        valorFinal += custo;
    } else if (tipoNota === "nota3") {
        valorFinal += custo * 2;
    }
  
    // Somando a porcentagem adicional sobre o valor do custo
    if (porcentagemAdicional > 0) {
        valorFinal += custo * (porcentagemAdicional / 100);
    }
  
    document.getElementById("resultado").style.display = "block";
    document.getElementById("resultado").textContent = `Valor Final: R$ ${valorFinal.toFixed(2)}`;
  }
  function calcularPromocao() {
    const custo = parseFloat(document.getElementById("promo-custo").value);
    const precoVenda = parseFloat(
      document.getElementById("promo-precoVenda").value
    );
    const imposto = 0.0108; // imposto de 1,08%
    const comissao = 0.20;
    const taxaPedido = 4;
  
    // Verificação de campos vazios
    if (isNaN(custo) || isNaN(precoVenda)) {
      alert("Por favor, preencha todos os campos para efetuar o cálculo.");
      return;
    }
  
    let tableHTML = `<table>
                 <thead>
                   <tr>
                     <th>Desconto (%)</th>
                     <th>Preço com Desconto (R$)</th>
                     <th>Lucro (R$)</th>
                     <th>Margem Líquida (%)</th>
                   </tr>
                 </thead>
                 <tbody>`;
  
    for (let desconto = 5; desconto <= 90; desconto += 5) {
      const precoComDesconto =
        precoVenda - precoVenda * (desconto / 100);
      const valorImposto = precoComDesconto * imposto;
      const valorComissao = precoComDesconto * comissao;
      const lucro =
        precoComDesconto - custo - valorImposto - valorComissao - taxaPedido;
      const descontoValor = precoVenda - precoComDesconto;
  
      // Calcular margem líquida em %
      const margemLiquida = (lucro / precoComDesconto) * 100;
  
      let classeLucro = "";
      let classeMargem = "";
  
      // Lógica de cores para a célula de lucro
      if (descontoValor >= 1 && descontoValor <= 10) {
        classeLucro = "green";
      } else if (lucro > 0) {
        classeLucro = "green";
      } else if (lucro === 0) {
        classeLucro = "green";
      } else {
        classeLucro = "red";
      }
  
      // Lógica de cores para a célula de margem líquida
      if (margemLiquida > 0) {
        classeMargem = "green";
      } else if (margemLiquida < 0) {
        classeMargem = "red";
      } else {
        classeMargem = "green"; // Para margem 0, podemos manter como verde
      }
  
      tableHTML += `<tr>
        <td>${desconto}%</td>
        <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoComDesconto)}</td>
        <td class="${classeLucro}">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro)}</td>
        <td class="${classeMargem}">${margemLiquida.toFixed(2)}%</td>
      </tr>`;
    }
  
    tableHTML += `</tbody></table>`;
    document.getElementById("promo-result").innerHTML = tableHTML;
  }
  