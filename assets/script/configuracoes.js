document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
});

function loadSettings() {
    // Carrega configurações do localStorage
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Aplica configurações salvas
    if (settings.notifications !== undefined) {
        document.getElementById('notifications').checked = settings.notifications;
    }
    if (settings.emailNotifications !== undefined) {
        document.getElementById('email-notifications').checked = settings.emailNotifications;
    }
    if (settings.fontSize) {
        document.getElementById('font-size').value = settings.fontSize;
    }
}

function setupEventListeners() {
    // Salva configurações automaticamente quando alteradas
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', saveSettings);
    });
}

function saveSettings() {
    const settings = {
        notifications: document.getElementById('notifications').checked,
        emailNotifications: document.getElementById('email-notifications').checked,
        profileVisibility: document.getElementById('profile-visibility').checked,
        dataCollection: document.getElementById('data-collection').checked,
        fontSize: document.getElementById('font-size').value,
        highContrast: document.getElementById('high-contrast').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Aplica configurações imediatamente
    applySettings(settings);
}

function applySettings(settings) {
    // Aplica tamanho da fonte
    document.body.style.fontSize = settings.fontSize === 'large' ? '18px' : 
                                  settings.fontSize === 'small' ? '14px' : '16px';
    
    // Aplica alto contraste
    if (settings.highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
}

function openPrivacyPolicy() {
    alert('Política de Privacidade será exibida aqui');
    // window.open('privacy-policy.html', '_blank');
}

function openTerms() {
    alert('Termos de Uso serão exibidos aqui');
    // window.open('terms.html', '_blank');
}

function exportData() {
    if (confirm('Deseja exportar todos os seus dados?')) {
        // Simular exportação
        alert('Seus dados serão preparados para download...');
        // Implementar lógica real de exportação
    }
}

function deleteAccount() {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        if (confirm('Esta ação é irreversível. Confirmar exclusão?')) {
            // Implementar exclusão de conta
            alert('Conta marcada para exclusão. Você será redirecionado.');
            setTimeout(() => {
                logout();
            }, 2000);
        }
    }
}