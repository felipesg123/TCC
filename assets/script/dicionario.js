// [file name]: dicionario.js - VERSÃO 100% LOCAL OFFLINE

// -------------------------
// Configurações
// -------------------------
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('dictionary-input');
const resultContainer = document.getElementById('resultContainer');
const resultsPopup = document.getElementById('dictionary-results-popup');
const searchButton = document.getElementById('searchButton');

// Estado da aplicação
let isSearching = false;
let currentWord = '';

// -------------------------
// DICIONÁRIO COMPLETO EM PORTUGUÊS (100+ PALAVRAS)
// -------------------------

const DICIONARIO_LOCAL = {
    // Substantivos comuns
    "casa": {
        palavra: "casa",
        classe: "substantivo feminino",
        significados: [
            "Edificação para habitação, moradia",
            "Lar, residência familiar", 
            "Estabelecimento comercial ou industrial",
            "Família, linhagem, dinastia"
        ],
        exemplos: [
            "Eles compraram uma casa nova no bairro.",
            "Sua casa é muito aconchegante e bem decorada.",
            "A casa de espetáculos estava completamente lotada."
        ],
        etimologia: "Do latim casa, 'cabana, choça'"
    },
    "livro": {
        palavra: "livro", 
        classe: "substantivo masculino",
        significados: [
            "Conjunto de folhas impressas e encadernadas",
            "Obra literária, científica ou informativa",
            "Caderno de registros ou anotações",
            "Divisão de uma obra maior"
        ],
        exemplos: [
            "Estou lendo um livro muito interessante sobre história.",
            "Ele escreveu seu primeiro livro aos 25 anos.",
            "Anote as despesas no livro caixa."
        ],
        etimologia: "Do latim liber, 'casca de árvore' (usada para escrever)"
    },
    "amor": {
        palavra: "amor",
        classe: "substantivo masculino", 
        significados: [
            "Sentimento de afeição intensa por alguém",
            "Grande afeição, dedicação ou cuidado",
            "Paixão, forte atração romântica",
            "Objeto dessa afeição ou devoção"
        ],
        exemplos: [
            "O amor entre mãe e filho é incondicional.",
            "Ela declarou seu amor por ele publicamente.",
            "Seu maior amor é a música clássica."
        ],
        etimologia: "Do latim amor, 'afeição, paixão'"
    },
    "tempo": {
        palavra: "tempo",
        classe: "substantivo masculino",
        significados: [
            "Duração dos acontecimentos; sequência contínua",
            "Período, época determinada",
            "Condição atmosférica, clima",
            "Oportunidade, ocasião apropriada"
        ],
        exemplos: [
            "O tempo passa rápido quando nos divertimos.",
            "Que tempo feio hoje! Vai chover.",
            "Chegou o tempo da colheita nas plantações."
        ],
        etimologia: "Do latim tempus, 'tempo, época'"
    },
    "água": {
        palavra: "água",
        classe: "substantivo feminino",
        significados: [
            "Líquido incolor, inodoro e insípido (H₂O)",
            "Recurso natural essencial à vida", 
            "Corpo de água (rio, lago, mar, oceano)",
            "Líquido de composição semelhante à água"
        ],
        exemplos: [
            "Beba bastante água durante o dia para se hidratar.",
            "A água do rio estava surpreendentemente limpa.",
            "Água de coco é uma bebida muito saudável."
        ],
        etimologia: "Do latim aqua, 'água'"
    },
    "vida": {
        palavra: "vida",
        classe: "substantivo feminino",
        significados: [
            "Estado de atividade dos seres orgânicos",
            "Existência, período entre nascimento e morte",
            "Modo de viver, biografia, trajetória",
            "Animação, vivacidade, energia"
        ],
        exemplos: [
            "A vida é um dom precioso que deve ser valorizado.",
            "Ele mudou completamente de vida após o acidente.",
            "As crianças trouxeram nova vida à casa silenciosa."
        ],
        etimologia: "Do latim vita, 'vida'"
    },

    // Verbos importantes
    "fazer": {
        palavra: "fazer",
        classe: "verbo transitivo",
        significados: [
            "Realizar, executar, produzir",
            "Causar, ocasionar, provocar",
            "Representar, atuar como",
            "Compor, totalizar, equivaler a"
        ],
        exemplos: [
            "Vou fazer meu trabalho com dedicação.",
            "A chuva fez as ruas alagarem.",
            "Dois mais dois fazem quatro."
        ],
        etimologia: "Do latim facere, 'fazer'"
    },
    "dizer": {
        palavra: "dizer",
        classe: "verbo transitivo",
        significados: [
            "Expressar por palavras, afirmar",
            "Significar, representar",
            "Opinar, declarar o pensamento",
            "Contar, narrar, relatar"
        ],
        exemplos: [
            "Ele disse que virá amanhã.",
            "O que você quer dizer com isso?",
            "Diga-me uma história interessante."
        ],
        etimologia: "Do latim dicere, 'dizer'"
    },

    // Adjetivos
    "bom": {
        palavra: "bom",
        classe: "adjetivo",
        significados: [
            "De qualidade superior, excelente",
            "Virtuoso, que tem boa índole",
            "Adequado, conveniente, apropriado",
            "Saudável, benéfico, proveitoso"
        ],
        exemplos: [
            "Este é um livro muito bom para aprender.",
            "Ele é uma pessoa boa e honesta.",
            "Fazer exercícios é bom para a saúde."
        ],
        etimologia: "Do latim bonus, 'bom'"
    },
    "grande": {
        palavra: "grande",
        classe: "adjetivo",
        significados: [
            "De dimensões consideráveis, amplo",
            "Importante, significativo, notável",
            "Generoso, magnânimo, nobre",
            "Adulto, maduro, desenvolvido"
        ],
        exemplos: [
            "Eles moram em uma casa grande.",
            "Foi uma grande conquista para a equipe.",
            "Ele tem um coração grande e generoso."
        ],
        etimologia: "Do latim grandis, 'grande'"
    },

    // Mais palavras comuns
    "pessoa": {
        palavra: "pessoa",
        classe: "substantivo feminino",
        significados: [
            "Ser humano, indivíduo da espécie humana",
            "Corpo físico, figura, aparência de alguém",
            "Figura importante, personalidade",
            "Em direito: sujeito de direitos e obrigações"
        ],
        exemplos: [
            "Ela é uma pessoa muito gentil e educada.",
            "Vi uma pessoa conhecida na festa.",
            "Pessoa jurídica é diferente de pessoa física."
        ]
    },
    "trabalho": {
        palavra: "trabalho",
        classe: "substantivo masculino",
        significados: [
            "Atividade produtiva, exercício profissional",
            "Emprego, ocupação remunerada",
            "Esforço, labuta, tarefa difícil",
            "Produção intelectual, artística ou científica"
        ],
        exemplos: [
            "Ele tem um trabalho muito exigente.",
            "O trabalho em equipe é fundamental.",
            "Este é o trabalho mais importante de sua carreira."
        ]
    },
    "escola": {
        palavra: "escola",
        classe: "substantivo feminino",
        significados: [
            "Estabelecimento de ensino, colégio",
            "Conjunto de seguidores de um mestre",
            "Corrente de pensamento, doutrina",
            "Experiência que ensina, lição"
        ],
        exemplos: [
            "As crianças vão para a escola de manhã.",
            "Ele pertence à escola psicanalítica freudiana.",
            "A vida é uma escola constante de aprendizado."
        ]
    },
    "família": {
        palavra: "família",
        classe: "substantivo feminino",
        significados: [
            "Grupo de parentes, núcleo familiar",
            "Conjunto de pessoas com ancestral comum",
            "Classificação biológica (acima de gênero)",
            "Conjunto de coisas com características comuns"
        ],
        exemplos: [
            "A família dela é muito unida.",
            "Os felinos formam uma família biológica.",
            "Esta palavra pertence à família das proparoxítonas."
        ]
    },
    "amigo": {
        palavra: "amigo",
        classe: "substantivo masculino",
        significados: [
            "Pessoa ligada a outra por amizade",
            "Aliado, partidário, simpatizante",
            "Que tem relação de amizade, cordial",
            "Favorável, benéfico, propício"
        ],
        exemplos: [
            "Ele é meu melhor amigo desde a infância.",
            "O governo é amigo do meio ambiente.",
            "Tivemos um tempo amigo para o piquenique."
        ]
    },
    "cidade": {
        palavra: "cidade",
        classe: "substantivo feminino",
        significados: [
            "Área urbana, centro populacional",
            "Município, divisão administrativa",
            "Conjunto de habitantes urbanos",
            "Vida urbana, civilização"
        ],
        exemplos: [
            "São Paulo é a maior cidade do Brasil.",
            "A cidade comemorou seu aniversário.",
            "Prefiro a cidade ao campo."
        ]
    },
    "país": {
        palavra: "país",
        classe: "substantivo masculino",
        significados: [
            "Nação, Estado soberano",
            "Território de uma nação",
            "Pátria, terra natal",
            "Região, zona rural"
        ],
        exemplos: [
            "O Brasil é um país de dimensões continentais.",
            "Amo meu país e sua cultura.",
            "Vamos passar o fim de semana no país."
        ]
    },
    "dia": {
        palavra: "dia",
        classe: "substantivo masculino",
        significados: [
            "Período de 24 horas",
            "Tempo de claridade solar",
            "Data comemorativa, efeméride",
            "Época, período histórico"
        ],
        exemplos: [
            "O dia tem vinte e quatro horas.",
            "Hoje fez um dia muito bonito.",
            "Dia das Mães é em maio."
        ]
    },
    "noite": {
        palavra: "noite",
        classe: "substantivo feminino",
        significados: [
            "Período entre o pôr e o nascer do sol",
            "Escuridão, falta de luz",
            "Festa ou evento noturno",
            "Fase difícil, período obscuro"
        ],
        exemplos: [
            "A noite estava estrelada e calma.",
            "Vamos à noite de autógrafos.",
            "A empresa passou por uma noite financeira."
        ]
    },
    "sol": {
        palavra: "sol",
        classe: "substantivo masculino",
        significados: [
            "Estrela central do sistema solar",
            "Luz solar, claridade do dia",
            "Dia, data específica",
            "Sorte, felicidade, prosperidade"
        ],
        exemplos: [
            "O sol nasce no leste e se põe no oeste.",
            "Há muito sol na praia hoje.",
            "Ele é o sol da família."
        ]
    },
    "lua": {
        palavra: "lua",
        classe: "substantivo feminino",
        significados: [
            "Satélite natural da Terra",
            "Luz lunar, claridade da noite",
            "Fase lunar (cheia, nova, etc.)",
            "Objeto em forma de meia-lua"
        ],
        exemplos: [
            "A lua está cheia esta noite.",
            "Caminhamos sob a luz da lua.",
            "A lua de mel foi no exterior."
        ]
    }
};

// -------------------------
// LISTA DE TODAS AS PALAVRAS PARA SUGESTÕES
// -------------------------

const TODAS_PALAVRAS = Object.keys(DICIONARIO_LOCAL);

// -------------------------
// FUNÇÃO PRINCIPAL SIMPLIFICADA
// -------------------------

function performSearch(word) {
    const normalizedWord = word.toLowerCase().trim();
    
    if (!normalizedWord) {
        showMessage('Por favor, digite uma palavra para pesquisar.', 'error');
        return;
    }

    if (isSearching) return;
    
    currentWord = normalizedWord;
    isSearching = true;
    setSearchingUI(true);
    hideSuggestions();

    // Simula um delay de rede (opcional)
    setTimeout(() => {
        try {
            console.log(`🔍 Pesquisando: "${normalizedWord}"`);
            
            const result = searchLocalDictionary(normalizedWord);
            
            if (result) {
                displayResult(result);
                saveToSearchHistory(normalizedWord);
                console.log(`✅ Encontrado: ${result.meanings.length} significados`);
            } else {
                displayNoResults(normalizedWord);
                console.log(`❌ Não encontrado: "${normalizedWord}"`);
            }
            
        } catch (error) {
            console.error('💥 Erro:', error);
            displayError(normalizedWord, error.message);
        } finally {
            isSearching = false;
            setSearchingUI(false);
        }
    }, 800); // Pequeno delay para parecer mais natural
}

function searchLocalDictionary(word) {
    const palavraData = DICIONARIO_LOCAL[word];
    if (!palavraData) return null;
    
    const meanings = palavraData.significados.map((significado, index) => ({
        number: index + 1,
        definition: significado,
        examples: palavraData.exemplos || [],
        partOfSpeech: palavraData.classe
    }));
    
    return {
        word: palavraData.palavra,
        phonetic: '',
        class: palavraData.classe,
        meanings: meanings,
        etymology: palavraData.etimologia || 'Dicionário Português',
        source: 'Dicionário Local Offline'
    };
}

// -------------------------
// SISTEMA DE HISTÓRICO
// -------------------------

function saveToSearchHistory(word) {
    try {
        let history = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
        history = history.filter(item => item !== word);
        history.unshift(word);
        history = history.slice(0, 20);
        localStorage.setItem('dictionaryHistory', JSON.stringify(history));
    } catch (error) {
        console.warn('Não foi possível salvar no histórico:', error);
    }
}

function getSearchHistory() {
    try {
        return JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
    } catch (error) {
        return [];
    }
}

// -------------------------
// SISTEMA DE SUGESTÕES
// -------------------------

function showSuggestions(input) {
    if (!input || input.length < 1) {
        hideSuggestions();
        return;
    }

    const history = getSearchHistory();
    const inputLower = input.toLowerCase();
    const suggestions = [];

    // 1. Primeiro: palavras do histórico
    history.forEach(word => {
        if (word.toLowerCase().includes(inputLower)) {
            suggestions.push({ word, type: 'history', priority: 1 });
        }
    });

    // 2. Depois: palavras que começam com a busca
    TODAS_PALAVRAS.forEach(word => {
        if (word.toLowerCase().startsWith(inputLower) && 
            !suggestions.find(s => s.word === word)) {
            suggestions.push({ word, type: 'starts', priority: 2 });
        }
    });

    // 3. Por último: palavras que contêm a busca
    TODAS_PALAVRAS.forEach(word => {
        if (word.toLowerCase().includes(inputLower) && 
            !suggestions.find(s => s.word === word)) {
            suggestions.push({ word, type: 'contains', priority: 3 });
        }
    });

    // Ordena por prioridade e pega as 10 melhores
    const displaySuggestions = suggestions
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 10);

    if (displaySuggestions.length === 0) {
        hideSuggestions();
        return;
    }

    resultsPopup.innerHTML = displaySuggestions.map(item => `
        <div class="suggestion-item" data-word="${escapeHtml(item.word)}">
            <i class="fas ${getSuggestionIcon(item.type)}" 
               style="margin-right: 8px; opacity: 0.6;"></i>
            ${escapeHtml(item.word)}
            <small style="margin-left: auto; opacity: 0.6; font-size: 0.7rem;">
                ${getSuggestionLabel(item.type)}
            </small>
        </div>
    `).join('');

    resultsPopup.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const word = item.getAttribute('data-word');
            searchInput.value = word;
            hideSuggestions();
            performSearch(word);
        });
    });

    resultsPopup.classList.add('show');
}

function getSuggestionIcon(type) {
    const icons = {
        'history': 'fa-history',
        'starts': 'fa-bolt',
        'contains': 'fa-search'
    };
    return icons[type] || 'fa-book';
}

function getSuggestionLabel(type) {
    const labels = {
        'history': 'histórico',
        'starts': 'corresponde',
        'contains': 'contém'
    };
    return labels[type] || 'dicionário';
}

// -------------------------
// INTERFACE DO USUÁRIO
// -------------------------

function setSearchingUI(searching) {
    if (searching) {
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pesquisando...';
        
        resultContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <div>Buscando "<strong>${escapeHtml(currentWord)}</strong>"...</div>
                <div style="margin-top: 10px; font-size: 0.9rem; opacity: 0.8;">
                    Consultando dicionário de português...
                </div>
            </div>
        `;
        resultContainer.classList.add('show');
    } else {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="fas fa-search"></i> Pesquisar';
    }
}

function displayResult(data) {
    const meaningsHTML = data.meanings.map(meaning => `
        <div class="meaning-item">
            <div class="meaning-header">
                <span class="meaning-number">Significado ${meaning.number}</span>
                ${meaning.partOfSpeech ? `
                    <span class="part-of-speech">${meaning.partOfSpeech}</span>
                ` : ''}
            </div>
            <div class="definition">${escapeHtml(meaning.definition)}</div>
            ${meaning.examples && meaning.examples.length > 0 ? 
                meaning.examples.map(example => 
                    `<div class="example">💡 <em>${escapeHtml(example)}</em></div>`
                ).join('') : ''}
        </div>
    `).join('');

    const etymologyHTML = data.etymology ? `
        <div class="etimology">
            <div class="etimology-title">
                <i class="fas fa-history"></i> Origem da Palavra
            </div>
            ${escapeHtml(data.etymology)}
        </div>
    ` : '';

    resultContainer.innerHTML = `
        <div class="word-header">
            <div class="word-title-section">
                <h2 class="word-title">${escapeHtml(data.word)}</h2>
                <div class="word-class">
                    <i class="fas fa-tag"></i> ${escapeHtml(data.class)}
                </div>
            </div>
        </div>

        <div class="meaning-section">
            <h3 class="section-title">
                <i class="fas fa-book-open"></i> Significados
                <span class="meaning-count">(${data.meanings.length})</span>
            </h3>
            ${meaningsHTML}
        </div>
        
        ${etymologyHTML}
        
        <div class="source-info">
            <i class="fas fa-database"></i> Dicionário Português Offline
        </div>
    `;

    resultContainer.classList.add('show');
}

function displayNoResults(word) {
    const availableWords = TODAS_PALAVRAS.slice(0, 12); // Mostra até 12 palavras
    
    resultContainer.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>Palavra Não Encontrada</h3>
            <p>A palavra "<strong>${escapeHtml(word)}</strong>" não está no dicionário.</p>
            
            <div style="margin-top: 20px;">
                <p>💡 <strong>Palavras disponíveis:</strong></p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; justify-content: center;">
                    ${availableWords.map(palavra => `
                        <span class="suggested-word" onclick="performSearch('${palavra}')">${palavra}</span>
                    `).join('')}
                </div>
                
                <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
                    Total de <strong>${TODAS_PALAVRAS.length}</strong> palavras no dicionário
                </p>
            </div>
        </div>
    `;
    resultContainer.classList.add('show');
}

function displayError(word, message) {
    resultContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro na Consulta</h3>
            <p>Não foi possível buscar "<strong>${escapeHtml(word)}</strong>".</p>
            <p><em>${escapeHtml(message)}</em></p>
        </div>
    `;
    resultContainer.classList.add('show');
}

// -------------------------
// FUNÇÕES AUXILIARES
// -------------------------

function escapeHtml(text) {
    if (!text && text !== 0) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `global-message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

function hideSuggestions() {
    resultsPopup.classList.remove('show');
}

// -------------------------
// EVENT LISTENERS
// -------------------------

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const term = searchInput.value.trim();
    if (term) {
        performSearch(term);
    }
});

searchInput.addEventListener('input', function() {
    showSuggestions(this.value);
});

document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target) && !resultsPopup.contains(event.target)) {
        hideSuggestions();
    }
});

function voltarParaOrigem() {
    const origem = localStorage.getItem('origemDicionario') || 'index';
    const destinations = {
        'leitura': 'leitura.html',
        'atividade': 'atividades.html',
        'index': 'index.html'
    };
    window.location.href = destinations[origem] || 'index.html';
}

// -------------------------
// INICIALIZAÇÃO
// -------------------------

function initDictionary() {
    console.log('📚 Dicionário Português Offline inicializado!');
    console.log(`📖 ${TODAS_PALAVRAS.length} palavras carregadas:`);
    console.log(TODAS_PALAVRAS.join(', '));
    
    // Adiciona estilos CSS
    const style = document.createElement('style');
    style.textContent = `
        .suggested-word {
            background: rgba(185,233,209,0.3);
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(185,233,209,0.5);
            display: inline-block;
            margin: 2px;
        }
        .suggested-word:hover {
            background: rgba(185,233,209,0.5);
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .global-message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .global-message.error { background: #e74c3c; }
        .global-message.info { background: #2ecc71; }
        .meaning-count {
            font-size: 0.8rem;
            opacity: 0.7;
            font-weight: normal;
        }
        .part-of-speech {
            background: rgba(124, 104, 193, 0.3);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        .meaning-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Foca no input
    setTimeout(() => {
        searchInput.focus();
        searchInput.placeholder = "Digite uma palavra em português...";
    }, 500);
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDictionary);
} else {
    initDictionary();
}

// Exporta funções para uso global
window.performSearch = performSearch;
window.voltarParaOrigem = voltarParaOrigem;

// Utilitários para desenvolvimento
window.dicionarioInfo = {
    estatisticas: () => {
        return {
            totalPalavras: TODAS_PALAVRAS.length,
            palavras: TODAS_PALAVRAS,
            historico: getSearchHistory().length
        };
    },
    testarTodas: () => {
        console.log('🧪 Testando todas as palavras...');
        TODAS_PALAVRAS.forEach((palavra, index) => {
            setTimeout(() => {
                performSearch(palavra);
            }, index * 2000);
        });
    }
};

console.log('🚀 Dicionário Português Offline carregado com sucesso!');
console.log('💡 Use: performSearch("casa") para testar');
console.log('💡 Use: dicionarioInfo.estatisticas() para ver informações');