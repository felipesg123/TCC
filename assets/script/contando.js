// [file name]: assets/script/contando.js

// Função para inicializar os inputs
function initInputs() {
    const inputs = document.querySelectorAll('.number-input');

    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('keydown', handleInputKeydown);
    });
}

// Função para lidar com mudanças nos inputs
function handleInputChange(e) {
    const input = e.target;
    const value = parseInt(input.value);
    const expected = parseInt(input.dataset.number);

    if (value === expected) {
        input.classList.add('correct');
        input.classList.remove('incorrect');
    } else if (input.value !== '' && value !== expected) {
        input.classList.add('incorrect');
        input.classList.remove('correct');
    } else {
        input.classList.remove('correct', 'incorrect');
    }
}

// Função para lidar com teclas nos inputs
function handleInputKeydown(e) {
    if (e.key === 'Enter') {
        const inputs = Array.from(document.querySelectorAll('.number-input'));
        const currentIndex = inputs.indexOf(e.target);
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else {
            checkSequence();
        }
    }
}

// Função para verificar a sequência
function checkSequence() {
    const inputs = document.querySelectorAll('.number-input');
    let correctCount = 0;

    inputs.forEach((input, index) => {
        const expected = (index + 1).toString();
        const actual = input.value.trim();

        if (actual === expected) {
            correctCount++;
            input.classList.add('correct');
            input.classList.remove('incorrect');
        } else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
        }
    });

    const progress = (correctCount / inputs.length) * 100;
    updateProgressVisual(progress);

    const resultMessage = document.getElementById('resultMessage');
    if (resultMessage) {
        if (correctCount === inputs.length) {
            resultMessage.textContent = '🎉 Parabéns! Você acertou toda a sequência!';
            resultMessage.className = 'result-message success';
            showTemporaryFeedback('Excelente! 🎊');

            // Efeitos de confete (simulado)
            createConfettiEffect();
        } else {
            resultMessage.textContent = `Você acertou ${correctCount} de ${inputs.length} números. Continue tentando!`;
            resultMessage.className = 'result-message error';
        }

        resultMessage.classList.remove('hidden');
    }
}

// Função para recomeçar a atividade
function resetActivity() {
    // Limpar inputs
    document.querySelectorAll('.number-input').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
    });

    // Esconder mensagem de resultado
    const resultMessage = document.getElementById('resultMessage');
    if (resultMessage) {
        resultMessage.classList.add('hidden');
    }

    // Resetar barra de progresso
    updateProgressVisual(0);
}

// Função para mostrar dica
function showHint() {
    const modal = document.getElementById('hintModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Função para fechar dica
function closeHint() {
    const modal = document.getElementById('hintModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Função para mostrar feedback temporário
function showTemporaryFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `progress-feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'success' ? 'rgba(76, 201, 240, 0.9)' : 'rgba(248, 113, 113, 0.9)'};
        color: white;
        padding: 20px 30px;
        border-radius: 16px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 1000;
        animation: pulse 0.5s ease;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

// Função para atualizar barra de progresso visual
function updateProgressVisual(progress) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.style.backgroundColor = progress === 100 ? 'var(--correct-color)' : 'var(--primary-color)';
    }
}

// Função para criar efeito de confete
function createConfettiEffect() {
    const colors = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#4ade80'];
    const container = document.querySelector('.counting-activity');

    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 2px;
            animation: confettiFall 1s ease-out forwards;
            z-index: 100;
        `;

        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.setProperty('--rotate', `${Math.random() * 360}deg`);
        confetti.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);

        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 1000);
    }
}

// Função de inicialização
function init() {
    initInputs();

    // Adicionar event listeners aos botões
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.includes('Verificar')) {
            btn.addEventListener('click', checkSequence);
        } else if (btn.textContent.includes('Recomeçar')) {
            btn.addEventListener('click', resetActivity);
        } else if (btn.textContent.includes('Dica')) {
            btn.addEventListener('click', showHint);
        }
    });

    // Fechar modal ao clicar fora
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('hintModal');
        if (modal && e.target === modal) {
            closeHint();
        }
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);
