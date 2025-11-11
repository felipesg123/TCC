// API do LanguageTool para correção de texto
const LANGUAGE_TOOL_API = 'https://api.languagetool.org/v2/check';

// Elementos da interface
const entradaElement = document.getElementById('entrada');
const corrigirButton = document.getElementById('corrigir');
const limparButton = document.getElementById('limpar');
const novoTemaButton = document.getElementById('novoTema');
const loadingElement = document.getElementById('loading');
const correctedTextElement = document.getElementById('correctedText');
const correctedTextContainer = document.getElementById('correctedTextContainer');
const popupOverlay = document.getElementById('popupOverlay');
const linhasContador = document.getElementById('linhasContador');
const protectionOverlay = document.getElementById('protectionOverlay');
const toast = document.getElementById('toast');

// Elementos do tema
const temaTextoElement = document.getElementById('temaTexto');
const tipoTextoElement = document.getElementById('tipoTexto');
const pessoaTextoElement = document.getElementById('pessoaTexto');
const tituloTextoElement = document.getElementById('tituloTexto');

// Variáveis globais
let currentCorrections = [];
let originalText = '';
let currentPopup = null;
let errorElementsMap = new Map();
let currentDifficulty = 'facil';
let lastKeyTime = 0;
let isTyping = false;

// Banco de dados de temas por dificuldade
const temasPorDificuldade = {
  facil: [
    "Meu animal de estimação favorito",
    "Minha comida preferida e por que gosto dela",
    "O que eu gosto de fazer nos finais de semana",
    "Descreva seu melhor amigo",
    "Minha matéria favorita na escola",
    "Como foi seu último aniversário",
    "O que você quer ser quando crescer",
    "Seu lugar favorito para visitar",
    "Um dia chuvoso ideal",
    "Seu brinquedo ou jogo favorito"
  ],
  medio: [
    "Os impactos das redes sociais na saúde mental dos jovens",
    "A importância da preservação da Amazônia para o equilíbrio climático",
    "Desafios e benefícios do ensino remoto na educação brasileira",
    "Como a inteligência artificial está transformando o mercado de trabalho",
    "A evolução dos smartphones e seu impacto na sociedade",
    "A importância da reciclagem para um futuro sustentável",
    "Os efeitos da pandemia de COVID-19 na economia global",
    "A representatividade LGBTQ+ no cinema e na televisão",
    "Os desafios da mobilidade urbana nas grandes cidades",
    "A influência da música no desenvolvimento infantil"
  ],
  dificil: [
    "A ética no desenvolvimento de inteligência artificial generalizada",
    "Os paradoxos temporais na física quântica e suas implicações filosóficas",
    "A desconstrução do conceito de gênero nas sociedades pós-modernas",
    "A relação entre capitalismo tardio e crises ambientais globais",
    "Os limites da liberdade de expressão em ambientes digitais",
    "A intersecção entre neurociência e filosofia da mente",
    "A crise dos refugiados climáticos no contexto geopolítico global",
    "A desmaterialização da economia na era da informação",
    "Os desafios epistemológicos do pós-estruturalismo",
    "A ressignificação do conceito de trabalho na quarta revolução industrial"
  ]
};

const tiposTexto = [
  "Dissertativo-argumentativo",
  "Narrativo",
  "Descritivo",
  "Injuntivo",
  "Expositivo"
];

const pessoas = [
  "1ª pessoa",
  "2ª pessoa",
  "3ª pessoa"
];

const titulos = [
  "Obrigatório",
  "Opcional"
];

// Função para mostrar toast
function showToast(message) {
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Função para detectar colagem rápida (CTRL+V)
function detectPaste(event) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastKeyTime;
  
  // Se CTRL foi pressionado e tempo entre teclas é muito curto, provavelmente é CTRL+V
  if ((event.ctrlKey || event.metaKey) && timeDiff < 100) {
    event.preventDefault();
    showToast('❌ Cópia e colagem estão desativadas para esta atividade');
    return false;
  }
  
  lastKeyTime = currentTime;
  return true;
}

// Função para bloquear clique direito
function blockRightClick(event) {
  event.preventDefault();
  showToast('❌ Clique direito desativado para esta atividade');
  return false;
}

// Função para bloquear atalhos de teclado (CTRL+C, CTRL+V, etc)
function blockKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && 
      (event.key === 'c' || event.key === 'C' || 
       event.key === 'v' || event.key === 'V' ||
       event.key === 'x' || event.key === 'X' ||
       event.key === 'a' || event.key === 'A')) {
    event.preventDefault();
    showToast('❌ Atalhos de teclado desativados para esta atividade');
    return false;
  }
  return true;
}

// Função para detectar colagem via menu de contexto
function blockContextMenuPaste(event) {
  const clipboardData = event.clipboardData || window.clipboardData;
  if (clipboardData) {
    const pastedText = clipboardData.getData('text');
    if (pastedText && pastedText.length > 50) { // Se texto colado for longo
      event.preventDefault();
      showToast('❌ Colagem de texto está desativada para esta atividade');
      return false;
    }
  }
  return true;
}

// Função para mostrar/ocultar overlay de proteção
function toggleProtectionOverlay(show) {
  if (show) {
    protectionOverlay.style.display = 'flex';
  } else {
    protectionOverlay.style.display = 'none';
  }
}

// Função para gerar tema aleatório baseado na dificuldade
function gerarTemaAleatorio(dificuldade) {
  const temas = temasPorDificuldade[dificuldade] || temasPorDificuldade.facil;
  const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
  const tipoAleatorio = tiposTexto[Math.floor(Math.random() * tiposTexto.length)];
  const pessoaAleatoria = pessoas[Math.floor(Math.random() * pessoas.length)];
  const tituloAleatorio = titulos[Math.floor(Math.random() * titulos.length)];
  
  return {
    tema: temaAleatorio,
    tipo: tipoAleatorio,
    pessoa: pessoaAleatoria,
    titulo: tituloAleatorio
  };
}

// Função para exibir tema na interface
function exibirTema(temaObj) {
  temaTextoElement.textContent = temaObj.tema;
  tipoTextoElement.textContent = temaObj.tipo;
  pessoaTextoElement.textContent = temaObj.pessoa;
  
  // Adiciona badge para título obrigatório
  if (temaObj.titulo === "Obrigatório") {
    tituloTextoElement.innerHTML = `${temaObj.titulo} <span class="theme-requirement">OBRIGATÓRIO</span>`;
  } else {
    tituloTextoElement.textContent = temaObj.titulo;
  }
}

// Função para contar linhas do texto
function contarLinhas(texto) {
  if (!texto.trim()) return 0;
  return texto.split('\n').length;
}

// Função para atualizar contador de linhas
function atualizarContadorLinhas() {
  const texto = entradaElement.value;
  const linhas = contarLinhas(texto);
  linhasContador.textContent = `${linhas} linhas`;
  
  // Destacar se tiver menos de 30 linhas
  if (linhas < 30) {
    linhasContador.style.color = '#f44336';
    linhasContador.style.fontWeight = 'bold';
  } else {
    linhasContador.style.color = '#666';
    linhasContador.style.fontWeight = 'normal';
  }
}

// Função para fazer a correção usando a API
async function corrigirComAPI(texto) {
  const data = new URLSearchParams();
  data.append('text', texto);
  data.append('language', 'pt-BR');
  data.append('enabledOnly', 'false');
  
  try {
    const response = await fetch(LANGUAGE_TOOL_API, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro na requisição à API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao acessar a API:', error);
    throw error;
  }
}

// Função para destacar erros no texto
function destacarErros(texto, correcoes) {
  const correcoesOrdenadas = [...correcoes].sort((a, b) => b.offset - a.offset);
  
  let textoComErrosDestacados = texto;
  errorElementsMap.clear();
  
  for (const correcao of correcoesOrdenadas) {
    const inicio = correcao.offset;
    const fim = inicio + correcao.length;
    const textoErrado = texto.substring(inicio, fim);
    
    const errorId = `error-${correcao.offset}-${Date.now()}`;
    
    const spanErro = `<span class="error-highlight new" data-error-id="${errorId}">${textoErrado}</span>`;
    
    textoComErrosDestacados = textoComErrosDestacados.substring(0, inicio) + 
                            spanErro + 
                            textoComErrosDestacados.substring(fim);
    
    errorElementsMap.set(errorId, correcao);
  }
  
  return textoComErrosDestacados;
}

// Função para calcular posição do popup
function calcularPosicaoPopup(elemento, popupWidth, popupHeight) {
  const rect = elemento.getBoundingClientRect();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Posição central do elemento
  const elementoCenterX = rect.left + scrollX + (rect.width / 2);
  const elementoTop = rect.top + scrollY;
  const elementoBottom = rect.bottom + scrollY;
  
  // Margem de segurança aumentada para garantir bordas visíveis
  const margin = 25;
  
  // Calcular posição X (horizontal)
  let popupX = elementoCenterX - (popupWidth / 2);
  
  // Verificar se o popup cabe na tela horizontalmente
  if (popupX < margin) {
    popupX = margin;
  } else if (popupX + popupWidth > viewportWidth - margin) {
    popupX = viewportWidth - popupWidth - margin;
  }
  
  // Calcular posição Y (vertical)
  let popupY;
  let position;
  
  // Altura disponível abaixo e acima do elemento
  const espacoAbaixo = viewportHeight - elementoBottom - margin;
  const espacoAcima = elementoTop - margin;
  
  // Verificar se cabe abaixo do elemento (com margem para borda)
  if (espacoAbaixo >= popupHeight + 10) {
    // Cabe abaixo - posicionar abaixo
    popupY = elementoBottom + margin;
    position = 'bottom';
  } else if (espacoAcima >= popupHeight + 10) {
    // Cabe acima - posicionar acima
    popupY = elementoTop - popupHeight - margin;
    position = 'top';
  } else {
    // Não cabe nem acima nem abaixo - posicionar no centro da tela
    popupY = (viewportHeight - popupHeight) / 2;
    position = 'top';
  }
  
  // GARANTIR QUE O POPUP NÃO FIQUE FORA DA TELA
  if (popupY < margin) {
    popupY = margin;
    position = 'bottom';
  } else if (popupY + popupHeight > viewportHeight - margin) {
    popupY = viewportHeight - popupHeight - margin;
    position = 'top';
  }
  
  return {
    x: Math.max(margin, Math.min(popupX, viewportWidth - popupWidth - margin)),
    y: Math.max(margin, Math.min(popupY, viewportHeight - popupHeight - margin)),
    position: position
  };
}

// Função para criar popup de correção
function criarPopupCorrecao(correcao, elemento) {
  fecharPopup();
  
  popupOverlay.style.display = 'block';

  const popup = document.createElement('div');
  popup.className = 'correction-popup';
  popup.id = 'current-popup';
  
  // Dimensões mais precisas do popup
  const popupWidth = 320;
  const popupHeight = 280;
  
  // Calcular posição que garante bordas visíveis
  const posicao = calcularPosicaoPopup(elemento, popupWidth, popupHeight);
  
  // Aplicar posição com garantia de bordas
  popup.style.left = `${posicao.x}px`;
  popup.style.top = `${posicao.y}px`;
  popup.setAttribute('data-position', posicao.position);

  // Determinar tipo de correção
  let tipoCorrecao = 'Tipografia';
  if (correcao.rule && correcao.rule.category) {
    if (correcao.rule.category.id === 'TYPOS') {
      tipoCorrecao = 'Ortografia';
    } else if (correcao.rule.category.id === 'GRAMMAR') {
      tipoCorrecao = 'Gramática';
    }
  }

  const sugestoesHTML = correcao.replacements && correcao.replacements.length > 0 
    ? correcao.replacements.slice(0, 5).map((rep, index) => 
        `<button class="suggestion-btn" data-suggestion="${rep.value.replace(/"/g, '&quot;')}">
            ${rep.value}
        </button>`
      ).join('')
    : '<p style="color: #666; font-size: 0.9rem; padding: 10px; text-align: center;">Nenhuma sugestão disponível</p>';

  popup.innerHTML = `
    <div class="popup-header">
      <span class="popup-title">Correção Sugerida</span>
      <button class="popup-close">&times;</button>
    </div>
    <div class="popup-error">${correcao.message}</div>
    <div>
      <small style="color: #666;">Tipo: <span class="popup-type">${tipoCorrecao}</span></small>
    </div>
    <div class="popup-suggestions">
      <strong style="display: block; margin-bottom: 8px; font-size: 0.9rem;">Sugestões:</strong>
      ${sugestoesHTML}
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = { element: popup, errorElement: elemento, correcao: correcao };

  // Event listeners
  const closeBtn = popup.querySelector('.popup-close');
  closeBtn.addEventListener('click', fecharPopup);

  const suggestionBtns = popup.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sugestao = btn.getAttribute('data-suggestion');
      aplicarCorrecao(sugestao);
    });
  });

  popupOverlay.addEventListener('click', fecharPopup);
}

// Função para fechar popup
function fecharPopup() {
  if (currentPopup) {
    currentPopup.element.remove();
    currentPopup = null;
  }
  popupOverlay.style.display = 'none';
}

// Função para aplicar uma correção específica
function aplicarCorrecao(sugestao) {
  if (!currentPopup) return;
  
  const { errorElement, correcao } = currentPopup;
  const errorId = errorElement.getAttribute('data-error-id');
  
  errorElement.outerHTML = sugestao;
  errorElementsMap.delete(errorId);
  
  const errosRestantes = document.querySelectorAll('.error-highlight').length;
  document.getElementById('erros').textContent = `${errosRestantes} erros`;
  
  fecharPopup();
  
  if (errosRestantes === 0) {
    setTimeout(() => {
      alert('🎉 Parabéns! Todos os erros foram corrigidos!');
    }, 500);
  }
}

// Função para aplicar event listeners aos erros destacados
function aplicarEventListenersAosErros() {
  const elementosErro = document.querySelectorAll('.error-highlight');
  
  elementosErro.forEach(elemento => {
    elemento.addEventListener('click', (e) => {
      e.stopPropagation();
      const errorId = elemento.getAttribute('data-error-id');
      const correcao = errorElementsMap.get(errorId);
      
      if (correcao) {
        criarPopupCorrecao(correcao, elemento);
      }
    });
  });
}

// Função para atualizar estatísticas
function atualizarEstatisticas(texto, erros = 0) {
  const palavras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
  const caracteres = texto.length;
  
  document.getElementById('palavras').textContent = `${palavras} palavras`;
  document.getElementById('caracteres').textContent = `${caracteres} caracteres`;
  document.getElementById('erros').textContent = `${erros} erros`;
}

// Evento de clique no botão de correção
corrigirButton.addEventListener('click', async () => {
  const texto = entradaElement.value.trim();
  
  if (texto === "") {
    correctedTextElement.innerHTML = "Por favor, digite algum texto para corrigir.";
    atualizarEstatisticas("", 0);
    return;
  }
  
  entradaElement.disabled = true;
  loadingElement.style.display = 'block';
  corrigirButton.disabled = true;
  
  try {
    const resultado = await corrigirComAPI(texto);
    currentCorrections = resultado.matches;
    originalText = texto;
    
    const textoComErrosDestacados = destacarErros(texto, resultado.matches);
    correctedTextElement.innerHTML = textoComErrosDestacados;
    
    aplicarEventListenersAosErros();
    atualizarEstatisticas(texto, resultado.matches.length);
    
  } catch (error) {
    correctedTextElement.innerHTML = "Erro ao corrigir o texto. Por favor, tente novamente.";
    console.error(error);
  } finally {
    loadingElement.style.display = 'none';
    corrigirButton.disabled = false;
  }
});

// Evento de clique no botão de limpar
limparButton.addEventListener('click', () => {
  entradaElement.value = '';
  entradaElement.disabled = false;
  correctedTextElement.innerHTML = 'Seu texto corrigido aparecerá aqui...';
  currentCorrections = [];
  originalText = '';
  errorElementsMap.clear();
  
  fecharPopup();
  atualizarEstatisticas('', 0);
  atualizarContadorLinhas();
});

// Evento de clique no botão de novo tema
novoTemaButton.addEventListener('click', () => {
  const novoTema = gerarTemaAleatorio(currentDifficulty);
  exibirTema(novoTema);
  
  // Feedback visual
  novoTemaButton.innerHTML = '<i class="fas fa-check"></i> Novo Tema Gerado!';
  setTimeout(() => {
    novoTemaButton.innerHTML = '<i class="fas fa-sync-alt"></i> Novo Tema';
  }, 2000);
});

// Eventos para botões de dificuldade
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remover classe active de todos os botões
    document.querySelectorAll('.difficulty-btn').forEach(b => {
      b.classList.remove('active');
    });
    
    // Adicionar classe active ao botão clicado
    this.classList.add('active');
    
    // Atualizar dificuldade atual
    currentDifficulty = this.getAttribute('data-difficulty');
    
    // Gerar novo tema com a dificuldade selecionada
    const novoTema = gerarTemaAleatorio(currentDifficulty);
    exibirTema(novoTema);
  });
});

// Atualizar estatísticas enquanto digita
entradaElement.addEventListener('input', function() {
  atualizarEstatisticas(this.value);
  atualizarContadorLinhas();
  isTyping = true;
});

// Inicializar
function inicializar() {
  // Gerar primeiro tema aleatório
  const primeiroTema = gerarTemaAleatorio(currentDifficulty);
  exibirTema(primeiroTema);
  
  // Inicializar estatísticas
  atualizarEstatisticas('', 0);
  atualizarContadorLinhas();
  
  // Aplicar proteções
  aplicarProtecoes();
}

// Aplicar todas as proteções contra cópia
function aplicarProtecoes() {
  // Bloquear clique direito
  document.addEventListener('contextmenu', blockRightClick);
  
  // Bloquear atalhos de teclado
  document.addEventListener('keydown', blockKeyboardShortcuts);
  
  // Detectar colagem
  document.addEventListener('keydown', detectPaste);
  document.addEventListener('paste', blockContextMenuPaste);
  
  // Mostrar overlay de proteção periodicamente
  setInterval(() => {
    if (!isTyping && entradaElement.value.length < 10) {
      toggleProtectionOverlay(true);
    } else {
      toggleProtectionOverlay(false);
    }
  }, 5000);
}

// Fechar popup com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharPopup();
  }
});

// Reposicionar popup no redimensionamento da janela
window.addEventListener('resize', () => {
  if (currentPopup) {
    const { errorElement, correcao } = currentPopup;
    fecharPopup();
    setTimeout(() => {
      criarPopupCorrecao(correcao, errorElement);
    }, 100);
  }
});

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', inicializar);