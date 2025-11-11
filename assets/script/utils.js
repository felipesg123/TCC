// [file name]: utils.js - ATUALIZADO

/**
 * NOVO: Função para criar um hash SHA-256 de uma string (senha).
 * Usa a Web Crypto API nativa do navegador.
 * @param {string} text - O texto a ser "hasheado".
 * @returns {Promise<string>} - Uma string hexadecimal representando o hash.
 */
async function hashPassword(text) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Converter o ArrayBuffer para uma string hexadecimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error('Erro ao gerar hash:', error);
        throw new Error('Não foi possível processar a senha.');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function showMessage(form, message, type = 'error') {
    // Remove mensagens anteriores
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    // Estilos básicos
    messageDiv.style.cssText = `
        padding: 12px;
        border-radius: 5px;
        margin-bottom: 15px;
        font-size: 0.95rem;
        text-align: center;
        border: 1px solid;
    `;
    
    if (type === 'error') {
        messageDiv.style.color = '#721c24';
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.borderColor = '#f5c6cb';
    } else { // success
        messageDiv.style.color = '#155724';
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.borderColor = '#c3e6cb';
    }
    
    messageDiv.innerHTML = message;
    form.insertBefore(messageDiv, form.firstChild);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function getLoggedInUser() {
    try {
        const user = localStorage.getItem('loggedInUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Erro ao recuperar usuário logado:', error);
        return null;
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

/**
 * Formata a data de nascimento para exibição
 */
function formatarDataNascimento(data) {
    if (!data) return 'Não informada';
    
    const dataObj = new Date(data + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR');
}

/**
 * Formata o nível de escolaridade para exibição
 */
function formatarEscolaridade(nivel) {
    const niveis = {
        'fundamental-incompleto': 'Fundamental Incompleto',
        'fundamental-completo': 'Fundamental Completo',
        'medio-incompleto': 'Médio Incompleto',
        'medio-completo': 'Médio Completo',
        'superior-incompleto': 'Superior Incompleto',
        'superior-completo': 'Superior Completo'
    };
    return niveis[nivel] || nivel;
}

/**
 * Verifica se o usuário atual é administrador
 */
function isUserAdmin() {
    const user = getLoggedInUser();
    return user && (user.isAdmin || user.tipo_usuario === 'admin');
}

/**
 * Redireciona para o painel administrativo se o usuário for admin
 */
function redirectToAdminPanelIfAuthorized() {
    if (isUserAdmin()) {
        window.location.href = 'painel_adm.html';
    }
}

/**
 * Mostra/oculta elementos baseado no status de admin
 */
function toggleAdminElements() {
    const adminElements = document.querySelectorAll('.admin-only');
    const isAdmin = isUserAdmin();
    
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });
}