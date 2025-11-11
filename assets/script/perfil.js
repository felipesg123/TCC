// [file name]: perfil.js - CORRIGIDO

/**
 * Função para voltar para a página anterior ao perfil
 */
function voltarParaPaginaAnterior() {
    const paginaAnterior = localStorage.getItem('paginaAnteriorPerfil');
    if (paginaAnterior) {
        window.location.href = paginaAnterior;
    } else {
        // Fallback para index.html se não houver página anterior salva
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se o usuário está logado
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializa o banco de dados
    await initDatabase();

    // Elementos do DOM
    const profilePic = document.getElementById('profilePic');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userLevelBar = document.getElementById('userLevelBar');
    const progressLabel = document.getElementById('progressLabel');
    const menuBtn = document.getElementById('menuBtn');
    const popupMenu = document.getElementById('popupMenu');

    // Carregar perfil do usuário
    await loadUserProfile(loggedInUser);

    // Configurar menu
    setupMenu();

    // Atualizar barra de progresso
    updateProgressBar();

    /**
     * Carrega os dados do perfil do usuário do banco SQLite
     */
    async function loadUserProfile(user) {
        try {
            // PRIMEIRO: Tenta carregar foto do localStorage (mais recente)
            const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            if (userProfile.profileImage) {
                profilePic.src = userProfile.profileImage;
                console.log('Foto carregada do localStorage:', userProfile.profileImage);
            }

            if (user.isAdmin) {
                // Se for admin, mostra dados básicos
                usernameDisplay.textContent = user.name;
                return;
            }

            // Busca dados completos do usuário no banco SQLite
            const stmt = window.db.prepare("SELECT * FROM usuarios WHERE id = ?");
            const userData = stmt.getAsObject([user.id]);
            stmt.free();

            if (userData.id) {
                // Atualiza a exibição com dados reais
                usernameDisplay.textContent = userData.usuario || user.name;

                // SEGUNDO: Se não tem foto no localStorage, carrega do banco
                if (!userProfile.profileImage && userData.foto_perfil && userData.foto_perfil !== 'assets/icon/user icon.png') {
                    profilePic.src = userData.foto_perfil;
                    console.log('Foto carregada do banco:', userData.foto_perfil);

                    // Salva no localStorage para acesso rápido
                    userProfile.profileImage = userData.foto_perfil;
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                }

                // Atualiza dados no localStorage para manter consistência
                const updatedUser = {
                    ...user,
                    name: userData.usuario,
                    email: userData.email,
                    dataNascimento: userData.data_nascimento,
                    escolaridade: userData.escolaridade,
                    atividadesRealizadas: userData.atividades_realizadas || 0,
                    nivelAtual: userData.nivel_atual || 'iniciante'
                };
                localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

                console.log('Perfil carregado do banco de dados:', userData);
            } else {
                console.warn('Usuário não encontrado no banco de dados');
                usernameDisplay.textContent = user.name;
            }

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            usernameDisplay.textContent = user.name;
        }
    }

    /**
     * Atualiza a barra de progresso baseada nas atividades do usuário
     */
    function updateProgressBar() {
        const user = getLoggedInUser();
        if (!user) return;

        let progress = 0;

        if (user.isAdmin) {
            progress = 100; // Admin tem progresso completo
        } else {
            // Calcula progresso baseado em atividades realizadas
            const atividades = user.atividadesRealizadas || 0;
            progress = Math.min((atividades / 10) * 100, 100); // 10 atividades = 100%
        }

        userLevelBar.value = progress;
        progressLabel.textContent = `${Math.round(progress)}%`;
    }

    /**
     * Configura o menu popup
     */
    function setupMenu() {
        // Abrir/Fechar Menu Popup
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popupMenu.classList.toggle('hidden');
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!popupMenu.contains(e.target) && e.target !== menuBtn) {
                popupMenu.classList.add('hidden');
            }
        });

        // Links do menu
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            window.location.href = 'editar-perfil.html';
        });

        document.getElementById('configBtn').addEventListener('click', () => {
            window.location.href = 'configuracoes.html';
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            logout();
        });
    }
});
