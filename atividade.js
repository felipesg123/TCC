// ... (código anterior do contando.js) ...

// Adicione estas funções para melhorar a experiência visual:

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

function updateProgressVisual(progress) {
    // Atualiza barra de progresso visual se existir
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.style.backgroundColor = progress === 100 ? 'var(--correct-color)' : 'var(--primary-color)';
    }
}

// Modifique a função checkSequence para incluir feedback visual:
function checkSequence() {
    const slots = document.querySelectorAll('.slot');
    let correctCount = 0;
    
    slots.forEach((slot, index) => {
        const expected = (index + 1).toString();
        const actual = slot.textContent;
        
        if (actual === expected) {
            correctCount++;
            slot.classList.add('correct');
            slot.classList.remove('incorrect');
        } else {
            slot.classList.add('incorrect');
            slot.classList.remove('correct');
        }
    });
    
    const progress = (correctCount / slots.length) * 100;
    updateProgressVisual(progress);
    
    const resultMessage = document.getElementById('resultMessage');
    if (correctCount === slots.length) {
        resultMessage.textContent = '🎉 Parabéns! Você acertou toda a sequência!';
        resultMessage.className = 'result-message success';
        showTemporaryFeedback('Excelente! 🎊');
        
        // Efeitos de confete (simulado)
        createConfettiEffect();
    } else {
        resultMessage.textContent = `Você acertou ${correctCount} de ${slots.length} números. Continue tentando!`;
        resultMessage.className = 'result-message error';
    }
    
    resultMessage.classList.remove('hidden');
}

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

// Adicione este keyframe no CSS ou via JavaScript:
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(300px) rotate(var(--rotate)) translateX(var(--x));
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);