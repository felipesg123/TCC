// [file name]: BemVindo.js - COMPLETO E CORRIGIDO

// =============================================
// DADOS DE EXEMPLO PARA AS ATIVIDADES
// =============================================

const activities = [
    {
        id: 1,
        title: "Alfabeto Mágico",
        category: "alfabetizacao",
        difficulty: "iniciante",
        description: "Aprenda as letras do alfabeto de forma divertida",
        progress: 75,
        icon: "fas fa-book"
    },
    {
        id: 2,
        title: "Contando até 10",
        category: "matematica",
        difficulty: "iniciante",
        description: "Pratique a contagem com números de 1 a 10",
        progress: 90,
        icon: "fas fa-calculator"
    },
    {
        id: 3,
        title: "Histórias da Vida",
        category: "leitura",
        difficulty: "intermediario",
        description: "Leia e compreenda histórias curtas",
        progress: 60,
        icon: "fas fa-book-open"
    },
    {
        id: 4,
        title: "Escrevendo Meu Nome",
        category: "escrita",
        difficulty: "iniciante",
        description: "Aprenda a escrever seu próprio nome",
        progress: 100,
        icon: "fas fa-pen"
    },
    {
        id: 5,
        title: "Números Grandes",
        category: "matematica",
        difficulty: "intermediario",
        description: "Trabalhe com números de 2 dígitos",
        progress: 45,
        icon: "fas fa-sort-numeric-up"
    },
    {
        id: 6,
        title: "Regras da Sociedade",
        category: "cidadania",
        difficulty: "intermediario",
        description: "Entenda as regras básicas de convivência",
        progress: 30,
        icon: "fas fa-users"
    },
    {
        id: 7,
        title: "Frases Complexas",
        category: "leitura",
        difficulty: "avancado",
        description: "Leia textos com frases mais complexas",
        progress: 20,
        icon: "fas fa-glasses"
    },
    {
        id: 8,
        title: "Redação Criativa",
        category: "escrita",
        difficulty: "avancado",
        description: "Crie suas próprias histórias",
        progress: 15,
        icon: "fas fa-edit"
    }
];

// =============================================
// VARIÁVEIS GLOBAIS
// =============================================

let filteredActivities = [...activities];
let currentFilters = {
    category: 'all',
    difficulty: 'all',
    search: ''
};

// =============================================
// FUNÇÕES PRINCIPAIS - USUÁRIO E PERFIL
// =============================================

/**
 * Verifica se o usuário está logado e atualiza a interface
 */
function checkUserProfile() {
    const userProfileBtn = document.querySelector('.user-profile-btn');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (!userProfileBtn || !userAvatar) return;
    
    // Verifica se há usuário logado no localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (loggedInUser) {
        // Usuário está logado - carrega foto do perfil
        loadUserProfilePicture(userAvatar);
        
        // Altera o link para ir para o perfil
        userProfileBtn.href = 'perfil.html';
        
        // Adiciona classe para indicar que está logado
        userProfileBtn.classList.add('logged-in');
        
        console.log('👤 Usuário logado detectado:', loggedInUser.name);
        console.log('É admin?', loggedInUser.isAdmin === true);
    } else {
        // Usuário não está logado - mantém ícone padrão e link para login
        userProfileBtn.href = 'login.html';
        userAvatar.src = 'assets/icon/user_icon.png';
        userAvatar.alt = 'Fazer login';
        userProfileBtn.classList.remove('logged-in');
        
        console.log('🚪 Nenhum usuário logado');
    }
    
    // SEMPRE verifica os botões admin (crítico!)
    verificarAdminEBotao();
}

/**
 * Carrega a foto do perfil do usuário
 */
function loadUserProfilePicture(userAvatar) {
    // Primeiro tenta carregar do localStorage (mais rápido)
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    if (userProfile && userProfile.profileImage) {
        userAvatar.src = userProfile.profileImage;
        console.log('📸 Foto carregada do localStorage');
        return;
    }
    
    // Se não tem no localStorage, tenta carregar do banco SQLite
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (loggedInUser && !loggedInUser.isAdmin) {
        // Para usuários normais, busca no banco
        if (typeof initDatabase === 'function' && window.db) {
            try {
                const stmt = window.db.prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
                const userData = stmt.getAsObject([loggedInUser.id]);
                stmt.free();
                
                if (userData.foto_perfil && userData.foto_perfil !== 'assets/icon/user icon.png') {
                    userAvatar.src = userData.foto_perfil;
                    console.log('📸 Foto carregada do banco SQLite');
                    
                    // Salva no localStorage para acesso rápido
                    const updatedProfile = { profileImage: userData.foto_perfil };
                    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                }
            } catch (error) {
                console.error('❌ Erro ao carregar foto do banco:', error);
            }
        }
    }
}

/**
 * Configura o comportamento do botão de perfil
 */
function setupProfileButton() {
    const userProfileBtn = document.querySelector('.user-profile-btn');

    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', function(e) {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

            if (!loggedInUser) {
                // Se não está logado, vai para login (comportamento padrão do link)
                return true;
            } else {
                // Se está logado, vai para o perfil
                e.preventDefault();

                // Salva a página atual no localStorage para voltar depois
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                localStorage.setItem('paginaAnteriorPerfil', currentPage);

                window.location.href = 'perfil.html';
            }
        });
    }
}

// =============================================
// FUNÇÕES DO BOTÃO ADMIN - CORREÇÃO CRÍTICA
// =============================================

/**
 * Verifica se o usuário é admin e mostra/remove os botões (DESKTOP E MOBILE)
 */
function verificarAdminEBotao() {
    const adminBtn = document.getElementById('admin-btn');
    const adminMobileBtn = document.querySelector('.admin-mobile');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // VERIFICAÇÃO CRÍTICA: Só é admin se existir E tiver isAdmin = true
    const isAdmin = loggedInUser && loggedInUser.isAdmin === true;

    console.log('=== VERIFICAÇÃO ADMIN ===');
    console.log('Usuário:', loggedInUser ? loggedInUser.name : 'Nenhum');
    console.log('É admin?', isAdmin);

    // Botão desktop (header)
    if (adminBtn) {
        if (isAdmin) {
            adminBtn.style.display = 'flex';
            console.log('✅ Botão admin desktop ATIVADO');

            // Configura o clique apenas uma vez
            adminBtn.onclick = function() {
                window.location.href = 'painel_adm.html';
            };
        } else {
            adminBtn.remove();
            console.log('❌ Botão admin desktop REMOVIDO (não-admin)');
        }
    } else {
        console.log('⚠️ Botão admin desktop não encontrado');
    }

    // Botão mobile (bottom-nav)
    if (adminMobileBtn) {
        if (isAdmin) {
            adminMobileBtn.style.display = 'flex';
            console.log('✅ Botão admin mobile ATIVADO');
        } else {
            adminMobileBtn.remove();
            console.log('❌ Botão admin mobile REMOVIDO (não-admin)');
        }
    } else {
        console.log('⚠️ Botão admin mobile não encontrado');
    }

    console.log('=== FIM VERIFICAÇÃO ===');
}

// =============================================
// FUNÇÕES DAS ATIVIDADES
// =============================================

/**
 * Renderiza as atividades na página
 */
function renderActivities(activitiesToRender) {
    const container = document.getElementById('activities-container');
    const noResults = document.getElementById('no-results');
    
    if (!container) return; // Se não existe na página atual
    
    if (activitiesToRender.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    container.innerHTML = activitiesToRender.map(activity => `
        <div class="activity-wrapper">
            <h3 class="activity-title">${activity.title}</h3>
            <div class="activity-card" data-id="${activity.id}">
                <div class="activity-content">
                    <i class="${activity.icon} activity-icon"></i>
                    <p class="activity-name">${activity.description}</p>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${activity.progress}%"></div>
            </div>
            <div class="activity-meta">
                <span class="category-badge">${getCategoryName(activity.category)}</span>
                <span class="difficulty-badge">${getDifficultyName(activity.difficulty)}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Funções auxiliares para categorias e dificuldades
 */
function getCategoryName(category) {
    const categories = {
        'alfabetizacao': 'Alfabetização',
        'matematica': 'Matemática',
        'cidadania': 'Cidadania',
        'leitura': 'Leitura',
        'escrita': 'Escrita'
    };
    return categories[category] || category;
}

function getDifficultyName(difficulty) {
    const difficulties = {
        'iniciante': 'Iniciante',
        'intermediario': 'Intermediário',
        'avancado': 'Avançado'
    };
    return difficulties[difficulty] || difficulty;
}

/**
 * Aplica os filtros nas atividades
 */
function applyFilters() {
    filteredActivities = activities.filter(activity => {
        const matchesCategory = currentFilters.category === 'all' || activity.category === currentFilters.category;
        const matchesDifficulty = currentFilters.difficulty === 'all' || activity.difficulty === currentFilters.difficulty;
        const matchesSearch = currentFilters.search === '' || 
            activity.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            activity.description.toLowerCase().includes(currentFilters.search.toLowerCase());
        
        return matchesCategory && matchesDifficulty && matchesSearch;
    });
    
    renderActivities(filteredActivities);
}

// =============================================
// CONFIGURAÇÃO DE EVENTOS DAS ATIVIDADES
// =============================================

/**
 * Configura os eventos dos filtros
 */
function setupEventListeners() {
    const categoryFilter = document.getElementById('category-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const searchFilter = document.getElementById('search-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', (e) => {
            currentFilters.difficulty = e.target.value;
            applyFilters();
        });
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
            applyFilters();
        });
    }
}

/**
 * Configura o botão de filtro do cabeçalho
 */
function setupHeaderFilterToggle() {
    const headerFilterBtn = document.getElementById('filter-btn');
    const filtersSection = document.querySelector('.filters-section');

    if (headerFilterBtn && filtersSection) {
        const arrow = headerFilterBtn.querySelector('.arrow-down');
        
        headerFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filtersSection.classList.toggle('hidden');
            
            // Rotacionar a seta do botão
            if (arrow) {
                if (filtersSection.classList.contains('hidden')) {
                    arrow.style.transform = 'rotate(45deg) scale(0.8)';
                } else {
                    arrow.style.transform = 'rotate(-135deg) scale(0.8)';
                }
            }
        });
    }
}

/**
 * Fecha o filtro ao clicar fora dele
 */
function setupClickOutsideToClose() {
    const filtersSection = document.querySelector('.filters-section');
    const headerFilterBtn = document.getElementById('filter-btn');
    
    if (!filtersSection || !headerFilterBtn) return;
    
    const arrow = headerFilterBtn.querySelector('.arrow-down');
    
    document.addEventListener('click', (e) => {
        // Se a seção de filtros está visível e o clique foi fora dela
        if (!filtersSection.classList.contains('hidden') && 
            !e.target.closest('.filters-section') && 
            !e.target.closest('#filter-btn')) {
            filtersSection.classList.add('hidden');
            if (arrow) {
                arrow.style.transform = 'rotate(45deg) scale(0.8)';
            }
        }
    });
    
    // Impede que cliques dentro da seção de filtros fechem ela
    if (filtersSection) {
        filtersSection.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// =============================================
// NAVEGAÇÃO E OUTRAS FUNÇÕES
// =============================================

/**
 * Destaca a página atual na navegação
 */
function highlightCurrentPage() {
    // Obter o caminho atual da URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Mapear nomes de arquivo para identificadores de página
    const pageMap = {
        'index.html': 'home',
        'perfil.html': 'perfil', 
        'atividades.html': 'atividades',
        'painel_adm.html': 'admin'
    };
    
    // Encontrar a página atual baseada no nome do arquivo
    const currentPageId = pageMap[currentPage] || 'home';
    
    // Remover a classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar a classe active ao botão correspondente à página atual
    const activeBtn = document.querySelector(`.nav-btn[data-page="${currentPageId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// =============================================
// INICIALIZAÇÃO PRINCIPAL
// =============================================

/**
 * Função de inicialização principal
 */
function init() {
    console.log('=== INICIANDO SISTEMA BEMVINDO ===');
    
    // =============================================
    // ORDEM CRÍTICA: Primeiro usuário, depois admin
    // =============================================
    checkUserProfile(); // Isso já chama verificarAdminEBotao()
    setupProfileButton();
    
    // =============================================
    // INICIALIZAÇÕES DAS ATIVIDADES
    // =============================================
    renderActivities(activities);
    setupEventListeners();
    setupHeaderFilterToggle();
    setupClickOutsideToClose();
    highlightCurrentPage();
    
    console.log('✅ Sistema BemVindo inicializado com sucesso!');
    
    // Verificação final de segurança
    setTimeout(() => {
        console.log('=== VERIFICAÇÃO FINAL DE SEGURANÇA ===');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const isAdmin = loggedInUser && loggedInUser.isAdmin === true;

        console.log('Status final:');
        console.log('Usuário logado:', loggedInUser ? loggedInUser.name : 'Nenhum');
        console.log('É admin?', isAdmin);
        console.log('Botão desktop existe:', !!document.getElementById('admin-btn'));
        console.log('Botão mobile existe:', !!document.querySelector('.admin-mobile'));

        if (!isAdmin) {
            // VERIFICAÇÃO EXTRA: garantir que botões não existem
            const adminBtn = document.getElementById('admin-btn');
            const adminMobileBtn = document.querySelector('.admin-mobile');

            if (adminBtn) {
                console.warn('⚠️  CORREÇÃO: Botão admin desktop encontrado para não-admin! Removendo...');
                adminBtn.remove();
            }

            if (adminMobileBtn) {
                console.warn('⚠️  CORREÇÃO: Botão admin mobile encontrado para não-admin! Removendo...');
                adminMobileBtn.remove();
            }
        }
    }, 500);
}

// =============================================
// INICIALIZAÇÃO DO BANCO DE DADOS
// =============================================

/**
 * Inicializa o sistema quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOM Carregado - Iniciando sistema...');
    
    try {
        // Tenta inicializar o banco de dados se disponível
        if (typeof initDatabase === 'function') {
            await initDatabase();
            console.log('✅ Banco de dados inicializado');
        }
        
        // Inicializa o sistema principal
        init();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Mesmo com erro, tenta inicializar o sistema
        init();
    }
});

// =============================================
// FUNÇÕES DE TESTE PARA DESENVOLVIMENTO
// =============================================

/**
 * Função para debug - mostra informações do usuário
 */
function debugUserInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    console.log('=== DEBUG USER INFO ===');
    console.log('Usuário logado:', loggedInUser);
    console.log('Perfil do usuário:', userProfile);
    console.log('É admin?', loggedInUser ? loggedInUser.isAdmin === true : false);
    console.log('=======================');
}

/**
 * Função para simular login de usuário comum
 */
function simularLoginUsuario() {
    const userData = {
        id: 1,
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        isAdmin: false // CRÍTICO: false para usuário comum
    };
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    console.log('🔧 Login usuário comum simulado!');
    console.log('❌ Botão admin DEVE estar OCULTO');
    setTimeout(() => {
        checkUserProfile();
        window.location.reload();
    }, 100);
}

/**
 * Função para simular login de admin
 */
function simularLoginAdmin() {
    const adminData = {
        id: 0,
        name: 'Administrador',
        email: 'admin@admin.com',
        isAdmin: true // CRÍTICO: true para admin
    };
    localStorage.setItem('loggedInUser', JSON.stringify(adminData));
    console.log('🔧 Login admin simulado!');
    console.log('✅ Botão admin DEVE estar VISÍVEL');
    setTimeout(() => {
        checkUserProfile();
        window.location.reload();
    }, 100);
}

/**
 * Função para logout
 */
function fazerLogout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userProfile');
    console.log('🚪 Logout realizado!');
    console.log('❌ Botão admin DEVE estar OCULTO');
    setTimeout(() => {
        checkUserProfile();
        window.location.reload();
    }, 100);
}

// =============================================
// DETECTOR DE ALTERAÇÕES NO LOCALSTORAGE
// =============================================

/**
 * Monitora mudanças no localStorage para atualizar em tempo real
 */
function setupLocalStorageListener() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'loggedInUser') {
            console.log('🔄 Mudança detectada no usuário logado');
            setTimeout(() => {
                checkUserProfile();
            }, 100);
        }
    });
}

// =============================================
// EXPORTAÇÕES PARA DESENVOLVIMENTO
// =============================================

// Torna as funções disponíveis globalmente para desenvolvimento
window.debugUserInfo = debugUserInfo;
window.simularLoginUsuario = simularLoginUsuario;
window.simularLoginAdmin = simularLoginAdmin;
window.fazerLogout = fazerLogout;

// Inicializa o listener quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    setupLocalStorageListener();
});

// =============================================
// VERIFICAÇÃO AUTOMÁTICA DE SEGURANÇA
// =============================================

/**
 * Verificação periódica de segurança
 */
function startSecurityCheck() {
    setInterval(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const isAdmin = loggedInUser && loggedInUser.isAdmin === true;

        const adminBtn = document.getElementById('admin-btn');
        const adminMobileBtn = document.querySelector('.admin-mobile');

        // Se não é admin mas os botões existem, remove
        if (!isAdmin) {
            if (adminBtn) {
                console.warn('🚨 CORREÇÃO DE SEGURANÇA: Botão admin encontrado para não-admin! Removendo...');
                adminBtn.remove();
            }
            if (adminMobileBtn) {
                console.warn('🚨 CORREÇÃO DE SEGURANÇA: Botão admin mobile encontrado para não-admin! Removendo...');
                adminMobileBtn.remove();
            }
        }
    }, 2000); // Verifica a cada 2 segundos
}

// Inicia a verificação de segurança
setTimeout(startSecurityCheck, 3000);