// [file name]: painel_adm.js - CORRIGIDO PARA SUA ESTRUTURA

// ========== VERIFICAÇÃO DE ACESSO ADMIN ==========

function verificarAcessoAdmin() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Acesso restrito! Você precisa ser administrador.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ========== NAVEGAÇÃO ENTRE SEÇÕES ==========

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (!this.getAttribute('data-section')) return;
        
        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.remove('active');
        });
        
        this.classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const sectionId = this.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            loadSectionData(sectionId);
        }
    });
});

// ========== FUNÇÕES DE BANCO DE DADOS ==========

// Buscar usuários - CORRIGIDO para sua estrutura
async function buscarUsuarios(filtros = {}) {
    if (!window.db) {
        console.error('Banco de dados não inicializado');
        return [];
    }

    try {
        // Query 100% adaptada à sua estrutura
        let query = `
            SELECT id, usuario, email, data_nascimento, escolaridade, 
                   telefone, data_criacao, foto_perfil
            FROM usuarios 
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filtros.busca) {
            query += ` AND (usuario LIKE ? OR email LIKE ?)`;
            const searchTerm = `%${filtros.busca}%`;
            params.push(searchTerm, searchTerm);
        }
        
        if (filtros.dataEntrada) {
            query += ` AND DATE(data_criacao) = ?`;
            params.push(filtros.dataEntrada);
        }
        
        query += ` ORDER BY data_criacao DESC`;
        
        console.log('Executando query:', query);
        
        const stmt = window.db.prepare(query);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        
        console.log('Usuários encontrados:', results.length);
        return results;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
}

// Buscar estatísticas - CORRIGIDO para sua estrutura
async function getEstatisticasUsuarios() {
    if (!window.db) return null;

    try {
        const query = `
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN DATE(data_criacao) >= DATE('now', '-7 days') THEN 1 END) as novos_esta_semana,
                COUNT(CASE WHEN DATE(data_criacao) >= DATE('now', '-30 days') THEN 1 END) as novos_este_mes
            FROM usuarios
            WHERE 1=1
        `;
        
        const stmt = window.db.prepare(query);
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        
        console.log('Estatísticas:', result);
        return result;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
    }
}

// Buscar configurações da IA
async function getConfigIA() {
    if (!window.db) return null;

    try {
        const stmt = window.db.prepare('SELECT * FROM ia_config ORDER BY updated_at DESC LIMIT 1');
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        return result;
    } catch (error) {
        console.error('Erro ao buscar configurações da IA:', error);
        return null;
    }
}

// Atualizar configurações da IA
async function atualizarConfigIA(config) {
    if (!window.db) return false;

    try {
        const { status, sensibilidade, tipo_feedback, personalidade, instrucoes_personalizadas } = config;
        
        const stmt = window.db.prepare(`
            INSERT OR REPLACE INTO ia_config 
            (id, status, sensibilidade, tipo_feedback, personalidade, instrucoes_personalizadas, updated_at)
            VALUES ((SELECT id FROM ia_config LIMIT 1), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        stmt.run([status ? 1 : 0, sensibilidade, tipo_feedback, personalidade, instrucoes_personalizadas || '']);
        stmt.free();
        
        await saveDatabase();
        return true;
    } catch (error) {
        console.error('Erro ao atualizar configurações da IA:', error);
        return false;
    }
}

// Buscar recomendações
async function buscarRecomendacoes(filtros = {}) {
    if (!window.db) return [];

    try {
        let query = `SELECT * FROM recomendacoes WHERE 1=1`;
        const params = [];
        
        if (filtros.busca) {
            query += ` AND (titulo LIKE ? OR descricao LIKE ? OR conteudo LIKE ?)`;
            const searchTerm = `%${filtros.busca}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filtros.nivel) {
            query += ` AND nivel = ?`;
            params.push(filtros.nivel);
        }
        
        if (filtros.categoria) {
            query += ` AND categoria = ?`;
            params.push(filtros.categoria);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const stmt = window.db.prepare(query);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        
        return results;
    } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        return [];
    }
}

// Adicionar recomendação
async function adicionarRecomendacao(dados) {
    if (!window.db) return false;

    try {
        const { titulo, descricao, nivel, categoria, conteudo } = dados;
        
        const stmt = window.db.prepare(`
            INSERT INTO recomendacoes (titulo, descricao, nivel, categoria, conteudo)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run([titulo, descricao, nivel, categoria, conteudo]);
        stmt.free();
        
        await saveDatabase();
        return true;
    } catch (error) {
        console.error('Erro ao adicionar recomendação:', error);
        return false;
    }
}

// Remover recomendação
async function removerRecomendacao(id) {
    if (!window.db) return false;

    try {
        const stmt = window.db.prepare(`DELETE FROM recomendacoes WHERE id = ?`);
        stmt.run([id]);
        stmt.free();

        await saveDatabase();
        return true;
    } catch (error) {
        console.error('Erro ao remover recomendação:', error);
        return false;
    }
}

// Atualizar recomendação
async function atualizarRecomendacao(dados) {
    if (!window.db) return false;

    try {
        const { id, titulo, descricao, nivel, categoria, conteudo } = dados;

        const stmt = window.db.prepare(`
            UPDATE recomendacoes
            SET titulo = ?, descricao = ?, nivel = ?, categoria = ?, conteudo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run([titulo, descricao, nivel, categoria, conteudo, id]);
        stmt.free();

        await saveDatabase();
        return true;
    } catch (error) {
        console.error('Erro ao atualizar recomendação:', error);
        return false;
    }
}

// ========== FUNÇÕES DE INTERFACE ==========

// Carregar dados da seção
async function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'users-section':
            await loadUsuarios();
            break;
        case 'ai-section':
            await loadIAConfig();
            break;
        case 'recommendations-section':
            await loadRecomendacoes();
            break;
        case 'reports-section':
            await loadRelatorios();
            break;
        case 'close-section':
            sairDoPainelAdmin();
            break;
        default:
            console.warn('Seção desconhecida:', sectionId);
    }
}

// Sair do painel admin
function sairDoPainelAdmin() {
    if (confirm('Deseja sair do painel administrativo e voltar para a aplicação?')) {
        window.location.href = 'index.html';
    }
}

// Carregar e exibir usuários - CORRIGIDO
async function loadUsuarios(filtros = {}) {
    const userGrid = document.getElementById('user-grid');
    if (!userGrid) return;
    
    userGrid.innerHTML = '<div class="loading-message">Carregando usuários...</div>';
    
    const usuarios = await buscarUsuarios(filtros);
    const estatisticas = await getEstatisticasUsuarios();
    
    // Atualizar estatísticas
    if (estatisticas) {
        document.getElementById('stat-usuarios-ativos').textContent = estatisticas.total_usuarios || '0';
        document.getElementById('stat-engajamento').textContent = '100%'; // Placeholder
        document.getElementById('stat-novos-usuarios').textContent = estatisticas.novos_esta_semana || '0';
        document.getElementById('stat-atividades-por-usuario').textContent = '0'; // Placeholder
    }
    
    // Atualizar grid de usuários
    if (usuarios.length > 0) {
        userGrid.innerHTML = usuarios.map(usuario => `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-avatar-large">${getIniciais(usuario.usuario)}</div>
                    <div class="user-name">${usuario.usuario}</div>
                </div>
                <div class="user-details">
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span>${usuario.email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data de nascimento:</span>
                        <span>${formatarData(usuario.data_nascimento)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data de cadastro:</span>
                        <span>${formatarData(usuario.data_criacao)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Escolaridade:</span>
                        <span>${formatarEscolaridade(usuario.escolaridade)}</span>
                    </div>
                    ${usuario.telefone ? `
                    <div class="detail-item">
                        <span class="detail-label">Telefone:</span>
                        <span>${usuario.telefone}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="verPerfilUsuario(${usuario.id})">Ver Perfil</button>
                    <button class="btn btn-secondary" onclick="editarUsuario(${usuario.id})">Editar</button>
                </div>
            </div>
        `).join('');
    } else {
        userGrid.innerHTML = '<div class="no-results">Nenhum usuário encontrado</div>';
    }
}

// Carregar configurações da IA
async function loadIAConfig() {
    const config = await getConfigIA();
    if (config) {
        document.getElementById('ai-status').checked = config.status === 1;
        document.getElementById('ai-sensitivity').value = config.sensibilidade || 'media';
        document.getElementById('ai-feedback').value = config.tipo_feedback || 'encorajador';
        document.getElementById('ai-personality').value = config.personalidade || 'amigavel';
        document.getElementById('ai-custom-instructions').value = config.instrucoes_personalizadas || '';
    } else {
        document.getElementById('ai-status').checked = true;
        document.getElementById('ai-sensitivity').value = 'media';
        document.getElementById('ai-feedback').value = 'encorajador';
        document.getElementById('ai-personality').value = 'amigavel';
        document.getElementById('ai-custom-instructions').value = '';
    }
}

// Carregar recomendações
async function loadRecomendacoes(filtros = {}) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-message">Carregando recomendações...</div>';
    
    const recomendacoes = await buscarRecomendacoes(filtros);
    
    if (recomendacoes.length > 0) {
        container.innerHTML = recomendacoes.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-cover">📚</div>
                <div class="recommendation-details">
                    <div class="recommendation-title">${rec.titulo}</div>
                    <div class="recommendation-description">${rec.descricao || 'Sem descrição'}</div>
                    <div class="detail-item">
                        <span class="detail-label">Nível:</span>
                        <span>${formatarNivel(rec.nivel)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Categoria:</span>
                        <span>${formatarCategoria(rec.categoria)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Visualizações:</span>
                        <span>${rec.visualizacoes || 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Criado em:</span>
                        <span>${formatarData(rec.created_at)}</span>
                    </div>
                    <div class="recommendation-actions">
                        <button class="btn btn-primary" onclick="editarRecomendacao(${rec.id})">Editar</button>
                        <button class="btn btn-danger" onclick="removerRecomendacaoUI(${rec.id})">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div class="no-results">Nenhuma recomendação encontrada</div>';
    }
}

// Carregar relatórios
async function loadRelatorios() {
    const estatisticas = await getEstatisticasUsuarios();
    
    if (estatisticas) {
        document.getElementById('report-total-users').textContent = estatisticas.total_usuarios || '0';
        document.getElementById('report-active-today').textContent = estatisticas.novos_esta_semana || '0';
        document.getElementById('report-total-activities').textContent = '0';
        document.getElementById('report-avg-progress').textContent = '100%';
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function getIniciais(nome) {
    if (!nome) return '?';
    return nome.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
}

function formatarData(data) {
    if (!data) return 'N/A';
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch {
        return 'Data inválida';
    }
}

function formatarNivel(nivel) {
    const niveis = {
        'iniciante': 'Iniciante',
        'intermediario': 'Intermediário',
        'avancado': 'Avançado'
    };
    return niveis[nivel] || nivel || 'Não definido';
}

function formatarEscolaridade(escolaridade) {
    const niveis = {
        'fundamental-incompleto': 'Fundamental Incompleto',
        'fundamental-completo': 'Fundamental Completo',
        'medio-incompleto': 'Médio Incompleto',
        'medio-completo': 'Médio Completo',
        'superior-incompleto': 'Superior Incompleto',
        'superior-completo': 'Superior Completo'
    };
    return niveis[escolaridade] || escolaridade || 'Não informada';
}

function formatarCategoria(categoria) {
    const categorias = {
        'stories': 'Histórias',
        'news': 'Notícias',
        'poems': 'Poemas',
        'informative': 'Informativo'
    };
    return categorias[categoria] || categoria;
}

// ========== FUNÇÕES DE AÇÃO ==========

function verPerfilUsuario(userId) {
    alert(`Visualizar perfil do usuário ID: ${userId}\n\nEsta funcionalidade será implementada em breve.`);
}

function editarUsuario(userId) {
    alert(`Editar usuário ID: ${userId}\n\nEsta funcionalidade será implementada em breve.`);
}

async function editarRecomendacao(recomendacaoId) {
    const recomendacoes = await buscarRecomendacoes();
    const recomendacao = recomendacoes.find(r => r.id === recomendacaoId);

    if (!recomendacao) {
        alert('Recomendação não encontrada!');
        return;
    }

    document.getElementById('edit-recommendation-id').value = recomendacao.id;
    document.getElementById('edit-title').value = recomendacao.titulo || '';
    document.getElementById('edit-description').value = recomendacao.descricao || '';
    document.getElementById('edit-level').value = recomendacao.nivel || 'iniciante';
    document.getElementById('edit-category').value = recomendacao.categoria || 'stories';
    document.getElementById('edit-content').value = recomendacao.conteudo || '';

    document.getElementById('edit-recommendation-modal').style.display = 'flex';
}

async function removerRecomendacaoUI(id) {
    if (confirm('Tem certeza que deseja remover esta recomendação?')) {
        const sucesso = await removerRecomendacao(id);
        if (sucesso) {
            alert('Recomendação removida com sucesso!');
            await loadRecomendacoes();
        } else {
            alert('Erro ao remover recomendação.');
        }
    }
}

// ========== EVENT LISTENERS ==========

// Buscar usuários
document.getElementById('user-search-btn')?.addEventListener('click', async function() {
    const filtros = {
        busca: document.getElementById('user-search-input').value,
        dataEntrada: document.getElementById('entry-date').value
    };
    
    await loadUsuarios(filtros);
});

// Buscar por Enter no input de usuários
document.getElementById('user-search-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('user-search-btn').click();
    }
});

// Salvar configurações da IA
document.getElementById('save-ai-config')?.addEventListener('click', async function() {
    const config = {
        status: document.getElementById('ai-status').checked,
        sensibilidade: document.getElementById('ai-sensitivity').value,
        tipo_feedback: document.getElementById('ai-feedback').value,
        personalidade: document.getElementById('ai-personality').value,
        instrucoes_personalizadas: document.getElementById('ai-custom-instructions').value
    };
    
    const sucesso = await atualizarConfigIA(config);
    if (sucesso) {
        alert('Configurações da IA salvas com sucesso!');
    } else {
        alert('Erro ao salvar configurações.');
    }
});

// Buscar recomendações
document.getElementById('recommendation-search-btn')?.addEventListener('click', async function() {
    const filtros = {
        busca: document.getElementById('recommendation-search-input').value,
        nivel: document.getElementById('recommendation-level').value,
        categoria: document.getElementById('recommendation-category').value
    };
    
    await loadRecomendacoes(filtros);
});

// Adicionar recomendação
document.getElementById('save-recommendation-btn')?.addEventListener('click', async function() {
    const dados = {
        titulo: document.getElementById('new-title').value.trim(),
        descricao: document.getElementById('new-description').value.trim(),
        nivel: document.getElementById('new-level').value,
        categoria: document.getElementById('new-category').value,
        conteudo: document.getElementById('new-content').value.trim()
    };

    if (!dados.titulo) {
        alert('Título é obrigatório!');
        return;
    }

    const sucesso = await adicionarRecomendacao(dados);
    if (sucesso) {
        alert('Recomendação adicionada com sucesso!');
        closeAddRecommendationModal();
        await loadRecomendacoes();
    } else {
        alert('Erro ao adicionar recomendação.');
    }
});

// Editar recomendação
document.getElementById('save-edit-recommendation-btn')?.addEventListener('click', async function() {
    const dados = {
        id: document.getElementById('edit-recommendation-id').value,
        titulo: document.getElementById('edit-title').value.trim(),
        descricao: document.getElementById('edit-description').value.trim(),
        nivel: document.getElementById('edit-level').value,
        categoria: document.getElementById('edit-category').value,
        conteudo: document.getElementById('edit-content').value.trim()
    };

    if (!dados.titulo) {
        alert('Título é obrigatório!');
        return;
    }

    const sucesso = await atualizarRecomendacao(dados);
    if (sucesso) {
        alert('Recomendação atualizada com sucesso!');
        closeEditRecommendationModal();
        await loadRecomendacoes();
    } else {
        alert('Erro ao atualizar recomendação.');
    }
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', function() {
    if (confirm('Deseja sair completamente da aplicação?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
});

// Voltar para o app
document.getElementById('back-to-app-btn')?.addEventListener('click', function() {
    sairDoPainelAdmin();
});

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', async function() {
    if (!verificarAcessoAdmin()) return;
    
    try {
        await initDatabase();
        console.log('✅ Painel admin inicializado com sucesso!');
        await loadUsuarios();
    } catch (error) {
        console.error('Erro ao inicializar painel administrativo:', error);
    }
});