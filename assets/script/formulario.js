// Atualizar barra de progresso
const inputs = document.querySelectorAll('input, select, textarea');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

function updateProgress() {
    let answered = 0;
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            answered++;
        }
    });
   
    const progress = (answered / inputs.length) * 100;
    progressBar.style.width = progress + '%';
    progressText.textContent = `Questão ${answered} de ${inputs.length}`;
}

inputs.forEach(input => {
    input.addEventListener('input', updateProgress);
});

// Validação do formulário
document.getElementById('evaluationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
   
    let score = 0;

    // Questão 1
    if (this.q1.value === "1") score += 1;

    // Questão 2
    if (this.q2.value.trim().split(' ').length >= 2) score += 1;

    // Questão 3
    if (this.q3.value.toLowerCase().includes("gato") ||
        this.q3.value.toLowerCase().includes("dorme") ||
        this.q3.value.toLowerCase().includes("cama")) score += 1;

    // Questão 4
    if (this.q4.value.includes("7") &&
        this.q4.value.includes("12") &&
        this.q4.value.includes("25")) score += 1;

    // Questão 5
    if (this.q5.value.includes("14") ||
        this.q5.value.includes("14h30") ||
        this.q5.value.includes("duas e meia")) score += 1;

    // Questão 6
    if (this.q6.value.toLowerCase().includes("validade") ||
        this.q6.value.toLowerCase().includes("vencimento") ||
        this.q6.value.toLowerCase().includes("até")) score += 1;

    // Questão 7
    if ((this.q7.value.toLowerCase().includes("pão") &&
         this.q7.value.toLowerCase().includes("leite")) ||
        this.q7.value.toLowerCase().includes("ambos")) score += 1;

    // Questão 8
    if (this.q8.value.includes("1.50") ||
        this.q8.value.includes("1,50") ||
        this.q8.value.includes("um real e cinquenta")) score += 1;

    // Questão 9
    if (this.q9.value.toLowerCase().includes("quinta") ||
        this.q9.value.toLowerCase().includes("quinta-feira")) score += 1;

    // Questão 10
    if (this.q10.value.toLowerCase().includes("saúde") ||
        this.q10.value.toLowerCase().includes("obesidade") ||
        this.q10.value.toLowerCase().includes("diabetes")) score += 1;

    // Determinar nível
    let nivel = "";
    if (score <= 3) {
        nivel = "grande dificuldade (alto analfabetismo funcional)";
    } else if (score <= 6) {
        nivel = "nível intermediário (consegue ler, mas tem dificuldades de interpretação)";
    } else {
        nivel = "bom nível de leitura funcional";
    }

    // Salvar resultados no localStorage
    localStorage.setItem('alfabitScore', score);
    localStorage.setItem('alfabitNivel', nivel);

    // Atualizar status do formulário no banco de dados
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && !loggedInUser.isAdmin) {
        try {
            const updateStmt = window.db.prepare("UPDATE usuarios SET formulario_completado = 1 WHERE id = ?");
            updateStmt.run([loggedInUser.id]);
            updateStmt.free();
            await saveDatabase();

            // Atualizar localStorage
            loggedInUser.formularioCompletado = true;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

            console.log('Formulário marcado como completado no banco de dados');
        } catch (error) {
            console.error('Erro ao atualizar status do formulário:', error);
        }
    }

    // Redirecionar para a página inicial
    window.location.href = 'index.html';
});

// Inicializar barra de progresso
updateProgress();
