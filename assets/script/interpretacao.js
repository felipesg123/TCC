// Banco de textos e perguntas
const atividades = [
  {
    titulo: "A Importância da Leitura",
    texto: `A leitura é uma das atividades mais importantes para o desenvolvimento intelectual e emocional do ser humano. Através dos livros, podemos viajar para lugares distantes, conhecer culturas diferentes e viver experiências que, de outra forma, seriam impossíveis.

A prática constante da leitura melhora o vocabulário, a escrita e a capacidade de argumentação. Além disso, estudos mostram que pessoas que leem regularmente têm maior capacidade de concentração e desenvolvem mais empatia, pois se colocam no lugar dos personagens e compreendem melhor os sentimentos alheios.

Em um mundo cada vez mais digital, manter o hábito da leitura é essencial para exercitar a mente e desenvolver o pensamento crítico.`,
    perguntas: [
      {
        pergunta: "Qual é o tema principal do texto?",
        alternativas: [
          "A importância dos livros digitais",
          "Os benefícios da leitura para o desenvolvimento humano",
          "Como viajar através dos livros",
          "A história da literatura"
        ],
        respostaCorreta: 1
      },
      {
        pergunta: "Segundo o texto, qual NÃO é um benefício da leitura mencionado?",
        alternativas: [
          "Melhora do vocabulário",
          "Desenvolvimento da empatia",
          "Aumento da capacidade física",
          "Aprimoramento da escrita"
        ],
        respostaCorreta: 2
      },
      {
        pergunta: "Por que a leitura ajuda a desenvolver empatia?",
        alternativas: [
          "Porque ensina regras gramaticais",
          "Porque coloca o leitor no lugar dos personagens",
          "Porque aumenta a velocidade de leitura",
          "Porque substitui as viagens reais"
        ],
        respostaCorreta: 1
      }
    ]
  },
  {
    titulo: "A Revolução Digital",
    texto: `A tecnologia digital transformou radicalmente a forma como nos comunicamos, trabalhamos e nos relacionamos. Nos últimos vinte anos, testemunhamos uma evolução acelerada que mudou para sempre a sociedade.

As redes sociais encurtaram distâncias, permitindo que pessoas de diferentes partes do mundo se conectem instantaneamente. O trabalho remoto tornou-se uma realidade para milhões de profissionais, enquanto a educação a distância democratizou o acesso ao conhecimento.

Porém, esses avanços também trouxeram desafios. A dependência de dispositivos eletrônicos, a superexposição nas redes sociais e a dificuldade de desconectar do trabalho são questões que a sociedade precisa enfrentar. O equilíbrio entre o uso benéfico da tecnologia e a preservação da saúde mental tornou-se fundamental.`,
    perguntas: [
      {
        pergunta: "Qual é a principal mudança mencionada no texto?",
        alternativas: [
          "O fim do trabalho presencial",
          "A transformação na forma de comunicação e relações",
          "A substituição completa da educação tradicional",
          "O desaparecimento das distâncias geográficas"
        ],
        respostaCorreta: 1
      },
      {
        pergunta: "Qual desafio NÃO é mencionado no texto?",
        alternativas: [
          "Dependência de dispositivos eletrônicos",
          "Superexposição nas redes sociais",
          "Aumento do custo de vida",
          "Dificuldade de desconectar do trabalho"
        ],
        respostaCorreta: 2
      },
      {
        pergunta: "O que se tornou fundamental segundo o texto?",
        alternativas: [
          "Usar apenas tecnologia moderna",
          "Abandonar as redes sociais",
          "Equilíbrio entre tecnologia e saúde mental",
          "Voltar aos métodos tradicionais"
        ],
        respostaCorreta: 2
      }
    ]
  }
];

let atividadeAtual = 0;
let respostasSelecionadas = [];
let modoRevisao = false;

// Função para carregar a atividade
function carregarAtividade(index) {
  const atividade = atividades[index];
  const textoElement = document.getElementById('texto');
  const perguntasElement = document.getElementById('perguntas');
  const resultadoElement = document.getElementById('resultado');
  const feedbackContainer = document.getElementById('feedbackContainer');
  const btnVerificar = document.getElementById('btnVerificar');
  const btnVoltar = document.getElementById('btnVoltar');
  
  // Resetar modo revisão
  modoRevisao = false;
  
  // Limpar respostas anteriores e esconder feedback
  respostasSelecionadas = new Array(atividade.perguntas.length).fill(null);
  resultadoElement.style.display = 'none';
  feedbackContainer.style.display = 'none';
  btnVerificar.style.display = 'flex';
  btnVoltar.style.display = 'none';
  
  // Carregar texto
  textoElement.innerHTML = `
    <h2>${atividade.titulo}</h2>
    <p>${atividade.texto.replace(/\n/g, '<br>')}</p>
  `;
  
  // Carregar perguntas
  perguntasElement.innerHTML = '';
  atividade.perguntas.forEach((pergunta, perguntaIndex) => {
    const perguntaElement = document.createElement('div');
    perguntaElement.className = 'pergunta';
    perguntaElement.innerHTML = `
      <h3>${perguntaIndex + 1}. ${pergunta.pergunta}</h3>
      <div class="alternativas">
        ${pergunta.alternativas.map((alternativa, altIndex) => `
          <div class="alternativa" onclick="selecionarAlternativa(${perguntaIndex}, ${altIndex})">
            ${alternativa}
          </div>
        `).join('')}
      </div>
    `;
    perguntasElement.appendChild(perguntaElement);
  });
}

// Função para selecionar alternativa
function selecionarAlternativa(perguntaIndex, alternativaIndex) {
  if (modoRevisao) return; // Não permite mudar respostas no modo revisão
  
  // Remover seleção anterior desta pergunta
  const alternativas = document.querySelectorAll(`.pergunta:nth-child(${perguntaIndex + 1}) .alternativa`);
  alternativas.forEach(alt => alt.classList.remove('selecionada'));
  
  // Selecionar nova alternativa
  alternativas[alternativaIndex].classList.add('selecionada');
  
  // Salvar resposta
  respostasSelecionadas[perguntaIndex] = alternativaIndex;
}

// Função para verificar respostas
function verificarRespostas() {
  const atividade = atividades[atividadeAtual];
  const resultadoElement = document.getElementById('resultado');
  const feedbackContainer = document.getElementById('feedbackContainer');
  const btnVerificar = document.getElementById('btnVerificar');
  const btnVoltar = document.getElementById('btnVoltar');
  
  let acertos = 0;
  let total = atividade.perguntas.length;

  // Verificar se todas as perguntas foram respondidas
  const perguntasNaoRespondidas = respostasSelecionadas.filter(r => r === null).length;
  if (perguntasNaoRespondidas > 0) {
    alert(`Por favor, responda todas as perguntas! Faltam ${perguntasNaoRespondidas} pergunta(s).`);
    return;
  }

  // Ativar modo revisão
  modoRevisao = true;

  // Mostrar feedback detalhado
  mostrarFeedbackDetalhado();

  // Verificar cada resposta e contar acertos
  atividade.perguntas.forEach((pergunta, index) => {
    if (respostasSelecionadas[index] === pergunta.respostaCorreta) {
      acertos++;
    }
  });

  // Mostrar resultado geral
  const percentual = (acertos / total) * 100;
  resultadoElement.style.display = 'block';
  
  if (percentual >= 70) {
    resultadoElement.className = 'resultado acerto';
    resultadoElement.innerHTML = `
      🎉 Parabéns! Você acertou ${acertos} de ${total} questões (${percentual.toFixed(0)}%)<br>
      <small>Excelente interpretação do texto!</small>
    `;
  } else {
    resultadoElement.className = 'resultado erro';
    resultadoElement.innerHTML = `
      📚 Você acertou ${acertos} de ${total} questões (${percentual.toFixed(0)}%)<br>
      <small>Continue praticando para melhorar!</small>
    `;
  }

  // Mostrar botão de voltar e esconder botão de verificar
  btnVerificar.style.display = 'none';
  btnVoltar.style.display = 'flex';

  // Rolar para o resultado
  resultadoElement.scrollIntoView({ behavior: 'smooth' });
}

// Função para mostrar feedback detalhado
function mostrarFeedbackDetalhado() {
  const atividade = atividades[atividadeAtual];
  const feedbackContainer = document.getElementById('feedbackContainer');
  const feedbackItens = document.getElementById('feedbackItens');
  
  feedbackItens.innerHTML = '';
  
  atividade.perguntas.forEach((pergunta, index) => {
    const respostaUsuario = respostasSelecionadas[index];
    const acertou = respostaUsuario === pergunta.respostaCorreta;
    
    const feedbackItem = document.createElement('div');
    feedbackItem.className = `feedback-item ${acertou ? 'feedback-correto' : 'feedback-incorreto'}`;
    
    const statusClass = acertou ? 'status-correto' : 'status-incorreto';
    const statusIcon = acertou ? '✓' : '✗';
    
    feedbackItem.innerHTML = `
      <div>
        <span class="status-pergunta ${statusClass}">${statusIcon}</span>
        <strong>Pergunta ${index + 1}:</strong> ${pergunta.pergunta}
      </div>
      <div class="resposta-correta">
        ${!acertou ? 
          `Sua resposta: "${pergunta.alternativas[respostaUsuario]}"<br>` : 
          ''
        }
        Resposta correta: "${pergunta.alternativas[pergunta.respostaCorreta]}"
      </div>
    `;
    
    feedbackItens.appendChild(feedbackItem);
  });
  
  feedbackContainer.style.display = 'block';
}

// Função para voltar para as perguntas
function voltarParaPerguntas() {
  // Recarregar a atividade para permitir novas tentativas
  carregarAtividade(atividadeAtual);
  
  // Rolar para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicializar a primeira atividade
document.addEventListener('DOMContentLoaded', function() {
  carregarAtividade(0);
});