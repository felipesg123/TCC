// [file name]: editar-perfil.js - CORRIGIDO

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
    const backBtn = document.getElementById('backBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');
    const profilePic = document.getElementById('profilePic');
    const profilePicUpload = document.getElementById('profilePicUpload');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');

    let initialProfileData = {};

    // Configurar eventos
    setupEventListeners();

    // Carregar dados atuais do usuário
    await loadCurrentProfile();

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Botão voltar
        backBtn.addEventListener('click', () => {
            window.history.back();
        });

        // Botão cancelar
        cancelBtn.addEventListener('click', () => {
            window.history.back();
        });

        // Upload de foto
        profilePicUpload.addEventListener('change', handleImageUpload);

        // Formulário
        editForm.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Carrega os dados atuais do perfil
     */
    async function loadCurrentProfile() {
        try {
            // PRIMEIRO: Tenta carregar foto do localStorage
            const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            if (userProfile.profileImage) {
                profilePic.src = userProfile.profileImage;
                console.log('Foto carregada do localStorage:', userProfile.profileImage);
            }

            if (loggedInUser.isAdmin) {
                // Para admin, carrega dados do localStorage
                nameInput.value = loggedInUser.name || '';
                emailInput.value = loggedInUser.email || '';
                phoneInput.value = '';
                
                initialProfileData = {
                    name: loggedInUser.name,
                    email: loggedInUser.email,
                    phone: '',
                    profileImage: profilePic.src
                };
                return;
            }

            // Para usuários normais, busca no banco SQLite
            const stmt = window.db.prepare("SELECT * FROM usuarios WHERE id = ?");
            const userData = stmt.getAsObject([loggedInUser.id]);
            stmt.free();

            if (userData.id) {
                // Preenche o formulário com dados atuais
                nameInput.value = userData.usuario || '';
                emailInput.value = userData.email || '';
                phoneInput.value = userData.telefone || '';
                
                // SEGUNDO: Se não tem foto no localStorage, carrega do banco
                if (!userProfile.profileImage && userData.foto_perfil && userData.foto_perfil !== 'assets/icon/user icon.png') {
                    profilePic.src = userData.foto_perfil;
                    console.log('Foto carregada do banco:', userData.foto_perfil);
                    
                    // Salva no localStorage
                    userProfile.profileImage = userData.foto_perfil;
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                }

                initialProfileData = {
                    name: userData.usuario,
                    email: userData.email,
                    phone: userData.telefone || '',
                    profileImage: profilePic.src
                };
            } else {
                console.warn('Usuário não encontrado no banco de dados');
                nameInput.value = loggedInUser.name || '';
                emailInput.value = loggedInUser.email || '';
            }

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            showMessage(editForm, 'Erro ao carregar dados do perfil.', 'error');
        }
    }

    /**
     * Manipula o upload de imagem
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Valida o tipo de arquivo
            if (!file.type.startsWith('image/')) {
                showMessage(editForm, 'Por favor, selecione uma imagem válida.', 'error');
                return;
            }

            // Valida o tamanho do arquivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage(editForm, 'A imagem deve ter no máximo 5MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                profilePic.src = e.target.result;
                
                // SALVA NO LOCALSTORAGE IMEDIATAMENTE
                const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
                userProfile.profileImage = e.target.result;
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                
                console.log('Foto salva no localStorage:', e.target.result);
                
                showMessage(editForm, 'Foto atualizada com sucesso!', 'success');
            };
            reader.onerror = function() {
                showMessage(editForm, 'Erro ao carregar a imagem.', 'error');
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Manipula o envio do formulário
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Coletar dados do formulário
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            profileImage: profilePic.src
        };

        // Validações
        if (formData.name.length < 3) {
            return showMessage(editForm, 'Nome deve ter pelo menos 3 caracteres.', 'error');
        }
        if (!validateEmail(formData.email)) {
            return showMessage(editForm, 'Por favor, insira um e-mail válido.', 'error');
        }

        try {
            // ATUALIZA SEMPRE NO LOCALSTORAGE (para acesso imediato)
            const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            userProfile.profileImage = formData.profileImage;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));

            if (loggedInUser.isAdmin) {
                // Para admin, atualiza apenas no localStorage
                const updatedAdmin = {
                    ...loggedInUser,
                    name: formData.name,
                    email: formData.email
                };
                localStorage.setItem('loggedInUser', JSON.stringify(updatedAdmin));
                
                showMessage(editForm, 'Perfil atualizado com sucesso!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'perfil.html';
                }, 1500);
                return;
            }

            // Para usuários normais, atualiza no banco SQLite
            // Verifica se o email já está em uso por outro usuário
            const checkEmailStmt = window.db.prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            const emailExists = checkEmailStmt.getAsObject([formData.email, loggedInUser.id]);
            checkEmailStmt.free();

            if (emailExists.id) {
                return showMessage(editForm, 'Este e-mail já está em uso por outro usuário.', 'error');
            }

            // Verifica se o nome de usuário já está em uso
            const checkUserStmt = window.db.prepare("SELECT id FROM usuarios WHERE usuario = ? AND id != ?");
            const userExists = checkUserStmt.getAsObject([formData.name, loggedInUser.id]);
            checkUserStmt.free();

            if (userExists.id) {
                return showMessage(editForm, 'Este nome de usuário já está em uso.', 'error');
            }

            // Atualiza os dados no banco
            const updateStmt = window.db.prepare(`
                UPDATE usuarios SET 
                    usuario = ?, 
                    email = ?, 
                    telefone = ?,
                    foto_perfil = ?
                WHERE id = ?
            `);
            
            updateStmt.run([
                formData.name,
                formData.email,
                formData.phone,
                formData.profileImage,
                loggedInUser.id
            ]);
            updateStmt.free();

            await saveDatabase();

            // Atualiza os dados no localStorage
            const updatedUser = {
                ...loggedInUser,
                name: formData.name,
                email: formData.email
            };
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

            showMessage(editForm, 'Perfil atualizado com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = 'perfil.html';
            }, 1500);

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showMessage(editForm, 'Erro ao atualizar perfil. Tente novamente.', 'error');
        }
    }

    /**
     * Função auxiliar para mostrar mensagens
     */
    function showMessage(form, message, type = 'error') {
        // Remove mensagens anteriores
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}-message`;
        
        // Estilos para as mensagens
        messageDiv.style.cssText = `
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
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

        // Remove a mensagem após 5 segundos (erro) ou 3 segundos (sucesso)
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, type === 'error' ? 5000 : 3000);
    }
});