// [file name]: script.js - ATUALIZADO

document.addEventListener('DOMContentLoaded', () => {
    // Garante que o banco de dados esteja pronto antes de configurar os formulários
    if (typeof initDatabase !== 'function') {
        console.error("O script database.js deve ser carregado antes de script.js");
        return;
    }
    
    // CORRIGIDO: Garante que a função de hash (de utils.js) também foi carregada
    if (typeof hashPassword !== 'function') {
        console.error("O script utils.js (com hashPassword) deve ser carregado antes de script.js");
        return;
    }

    initDatabase().then(() => {
        console.log("Banco de dados pronto para uso em login/cadastro.");
        setupForms();
        setupAllPasswordToggles();
    });
});

function setupForms() {
    // Configurar formulário de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        setupCadastroForm(cadastroForm, 'usuario', 'email', 'senha', 'data-nascimento', 'escolaridade');
    }
    const cadastroFormMobile = document.getElementById('cadastro-form-mobile');
    if (cadastroFormMobile) {
        setupCadastroForm(cadastroFormMobile, 'usuario-mobile', 'email-mobile', 'senha-mobile', 'data-nascimento-mobile', 'escolaridade-mobile');
    }

    // Configurar formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        setupLoginForm(loginForm, 'email', 'senha');
    }
    const loginFormMobile = document.getElementById('login-form-mobile');
    if (loginFormMobile) {
        setupLoginForm(loginFormMobile, 'email-mobile', 'senha-mobile');
    }
}

// Função para configurar formulários de cadastro
function setupCadastroForm(form, usuarioId, emailId, senhaId, dataNascimentoId, escolaridadeId) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario = document.getElementById(usuarioId).value.trim();
        const email = document.getElementById(emailId).value.trim();
        const dataNascimento = document.getElementById(dataNascimentoId).value;
        const escolaridade = document.getElementById(escolaridadeId).value;
        const senha = document.getElementById(senhaId).value;

        // Validações
        if (usuario.length < 3) return showMessage(form, 'Usuário deve ter pelo menos 3 caracteres.');
        if (!validateEmail(email)) return showMessage(form, 'Por favor, insira um e-mail válido.');
        if (!dataNascimento) return showMessage(form, 'Por favor, informe sua data de nascimento.');
        if (!escolaridade) return showMessage(form, 'Por favor, selecione seu nível de escolaridade.');
        if (senha.length < 6) return showMessage(form, 'A senha deve ter pelo menos 6 caracteres.');

        try {
            // CORRIGIDO: Utiliza placeholders (?) para prevenir Injeção de SQL.
            const checkUserStmt = window.db.prepare("SELECT * FROM usuarios WHERE usuario = ? OR email = ?");
            // CORRIGIDO: Passa os parâmetros como um array
            const existingUser = checkUserStmt.getAsObject([usuario, email]); 
            checkUserStmt.free();

            if (existingUser.id) {
                return showMessage(form, 'Usuário ou e-mail já cadastrado!');
            }

            // ==========================================================
            //      CORREÇÃO DE SEGURANÇA: GERAR HASH DA SENHA
            // ==========================================================
            const senhaHash = await hashPassword(senha);
            // ==========================================================

            // Inserir novo usuário
            const insertStmt = window.db.prepare("INSERT INTO usuarios (usuario, email, data_nascimento, escolaridade, senha) VALUES (?, ?, ?, ?, ?)");
            // CORRIGIDO: Insere o HASH da senha, não a senha em texto
            insertStmt.run([usuario, email, dataNascimento, escolaridade, senhaHash]);
            insertStmt.free();
            
            await saveDatabase(); // Salva o banco de dados após a alteração.

            showMessage(form, `Cadastro realizado com sucesso! Bem-vindo, ${usuario}. Redirecionando...`, 'success');
            form.reset();
            
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);

        } catch (error) {
            console.error('Erro no cadastro:', error);
            showMessage(form, 'Erro ao realizar cadastro. Tente novamente.');
        }
    });
}

// Função para configurar formulários de login
function setupLoginForm(form, emailId, senhaId) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById(emailId).value.trim();
        const senha = document.getElementById(senhaId).value;

        if (!validateEmail(email)) return showMessage(form, 'Por favor, insira um e-mail válido.');
        if (senha.length < 1) return showMessage(form, 'Por favor, digite sua senha.');

        try {
            // ==========================================================
            //      INJEÇÃO DO LOGIN DE ADMINISTRADOR (PARA DEV)
            // ==========================================================
            if (email === 'admin@admin.com' && senha === 'admin123') {
                
                // Define os dados do administrador
                const adminData = {
                    id: 0, // ID 0 para diferenciar de usuários normais
                    name: 'Administrador',
                    email: 'admin@admin.com',
                    isAdmin: true // A "chave mestra" que identifica o admin
                };

                // Salva os dados do admin no localStorage
                localStorage.setItem('loggedInUser', JSON.stringify(adminData));
                
                showMessage(form, 'Login de Administrador realizado com sucesso! Redirecionando...', 'success');
                form.reset();
                
                setTimeout(() => {
                    window.location.href = "perfil.html";
                }, 2000);

                return; // Impede que o resto do código (que busca no DB) seja executado
            }
            // ==========================================================
            //      FIM DA INJEÇÃO DO LOGIN DE ADMINISTRADOR
            // ==========================================================


            // ==========================================================
            //      CORREÇÃO DE SEGURANÇA: GERAR HASH DA SENHA DIGITADA
            // ==========================================================
            const senhaHash = await hashPassword(senha);
            // ==========================================================

            // O código abaixo continua funcionando para usuários normais
            // CORRIGIDO: Busca no banco comparando o email E o *hash* da senha
            const stmt = window.db.prepare("SELECT * FROM usuarios WHERE email = ? AND senha = ?");
            // CORRIGIDO: Passa os parâmetros como um array
            const user = stmt.getAsObject([email, senhaHash]);
            stmt.free();

            if (user.id) {
                // Verificar se o usuário já completou o formulário
                const formularioCompletado = user.formulario_completado === 1;

                // Salvar dados do usuário logado no localStorage
                const userData = {
                    id: user.id,
                    name: user.usuario,
                    email: user.email,
                    dataNascimento: user.data_nascimento,
                    escolaridade: user.escolaridade,
                    atividadesRealizadas: user.atividades_realizadas || 0,
                    nivelAtual: user.nivel_atual || 'iniciante',
                    isAdmin: false, // Garante que usuários normais não sejam admins
                    formularioCompletado: formularioCompletado
                };
                localStorage.setItem('loggedInUser', JSON.stringify(userData));

                showMessage(form, 'Login realizado com sucesso! Redirecionando...', 'success');
                form.reset();

                setTimeout(() => {
                    // Redirecionar baseado no status do formulário
                    if (formularioCompletado) {
                        window.location.href = "index.html";
                    } else {
                        window.location.href = "formulario.html";
                    }
                }, 2000);
            } else {
                showMessage(form, 'E-mail ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage(form, 'Erro ao fazer login. Tente novamente.');
        }
    });
}

// Funções para mostrar/ocultar senha (mantidas do seu código original)
function setupPasswordToggle(toggle, passwordInput) {
    toggle.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        const eyeIcon = toggle.querySelector('.eye-icon');
        if(eyeIcon) eyeIcon.src = isPassword ? '/assets/icon/eye-slash.svg' : '/assets/icon/eye.svg';
    });
}

function setupAllPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        const passwordInput = toggle.previousElementSibling;
        if (passwordInput && (passwordInput.type === 'password' || passwordInput.type === 'text')) {
            setupPasswordToggle(toggle, passwordInput);
        }
    });
}