// [file name]: database.js - CORRIGIDO

// Variável global para a instância do banco de dados
window.db = null;

/**
 * Salva o estado atual do banco de dados no localStorage.
 */
async function saveDatabase() {
    if (window.db) {
        try {
            const data = window.db.export();
            const buffer = new Uint8Array(data).buffer;
            localStorage.setItem('sqliteDb', JSON.stringify(Array.from(new Uint8Array(buffer))));
            console.log('Banco de dados salvo no localStorage.');
        } catch (error) {
            console.error('Erro ao salvar o banco de dados:', error);
        }
    }
}

/**
 * Inicializa o banco de dados.
 */
async function initDatabase() {
    if (window.db) {
        return window.db;
    }

    try {
        if (typeof initSqlJs === 'undefined') {
            throw new Error('SQL.js não foi carregado. Verifique a inclusão do script no HTML.');
        }

        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Tenta carregar o banco de dados do localStorage
        const dbDataStr = localStorage.getItem('sqliteDb');
        if (dbDataStr) {
            console.log('Carregando banco de dados do localStorage...');
            const dbData = new Uint8Array(JSON.parse(dbDataStr));
            window.db = new SQL.Database(dbData);
            // Executar migrações para bancos existentes
            runMigrations();
        } else {
            console.log('Criando um novo banco de dados...');
            window.db = new SQL.Database();
            // Criar a estrutura da tabela apenas na primeira vez
            createTables();
            await saveDatabase();
        }

        console.log('Banco de dados inicializado com sucesso.');
        return window.db;

    } catch (error) {
        console.error('Erro fatal ao inicializar o banco de dados:', error);
        return null;
    }
}

/**
 * Cria as tabelas necessárias se elas não existirem.
 */
function createTables() {
    if (!window.db) return;

    // Tabela de usuários (login/cadastro) - ESTRUTURA SIMPLIFICADA E CORRIGIDA
    const createUsuariosQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            data_nascimento TEXT NOT NULL,
            escolaridade TEXT NOT NULL,
            senha TEXT NOT NULL,
            telefone TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            nome_completo TEXT,
            bio TEXT,
            localizacao TEXT,
            website TEXT,
            foto_perfil TEXT DEFAULT 'assets/icon/circle-user-round',
            atividades_realizadas INTEGER DEFAULT 0,
            nivel_atual TEXT DEFAULT 'iniciante',
            pontos_experiencia INTEGER DEFAULT 0,
            ultimo_acesso DATE,
            nivel_atividade TEXT DEFAULT 'media',
            tipo_usuario TEXT DEFAULT 'comum',
            meta_atividades INTEGER DEFAULT 10,
            data_meta DATE,
            formulario_completado BOOLEAN DEFAULT 0
        )
    `;
    window.db.run(createUsuariosQuery);
    console.log('Tabela "usuarios" verificada/criada com sucesso.');

    // Tabela de configuração da IA
    const createIATable = `
        CREATE TABLE IF NOT EXISTS ia_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status BOOLEAN DEFAULT 1,
            sensibilidade TEXT DEFAULT 'media',
            tipo_feedback TEXT DEFAULT 'encorajador',
            personalidade TEXT DEFAULT 'amigavel',
            instrucoes_personalizadas TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    window.db.run(createIATable);

    // Tabela de recomendações
    const createRecomendacoesTable = `
        CREATE TABLE IF NOT EXISTS recomendacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            nivel TEXT NOT NULL,
            categoria TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            visualizacoes INTEGER DEFAULT 0,
            capa_url TEXT,
            tipo TEXT DEFAULT 'texto',
            arquivo_pdf TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    window.db.run(createRecomendacoesTable);

    // Inserir configuração padrão da IA
    const insertDefaultIA = `
        INSERT OR IGNORE INTO ia_config (status, sensibilidade, tipo_feedback, personalidade)
        VALUES (1, 'media', 'encorajador', 'amigavel')
    `;
    window.db.run(insertDefaultIA);

    // Inserir usuários de exemplo
    insertSampleUsers();
}

/**
 * Executa migrações para bancos de dados existentes.
 */
function runMigrations() {
    if (!window.db) return;

    console.log('Executando migrações...');

    // Migração 1: Adicionar colunas faltantes na tabela usuarios
    const columnsToAdd = [
        { name: 'nome_completo', type: 'TEXT' },
        { name: 'bio', type: 'TEXT' },
        { name: 'localizacao', type: 'TEXT' },
        { name: 'website', type: 'TEXT' },
        { name: 'foto_perfil', type: 'TEXT DEFAULT "assets/icon/user icon.png"' },
        { name: 'atividades_realizadas', type: 'INTEGER DEFAULT 0' },
        { name: 'nivel_atual', type: 'TEXT DEFAULT "iniciante"' },
        { name: 'pontos_experiencia', type: 'INTEGER DEFAULT 0' },
        { name: 'ultimo_acesso', type: 'DATE' },
        { name: 'nivel_atividade', type: 'TEXT DEFAULT "media"' },
        { name: 'tipo_usuario', type: 'TEXT DEFAULT "comum"' },
        { name: 'meta_atividades', type: 'INTEGER DEFAULT 10' },
        { name: 'data_meta', type: 'DATE' },
        { name: 'formulario_completado', type: 'BOOLEAN DEFAULT 0' }
    ];

    columnsToAdd.forEach(column => {
        try {
            window.db.run(`ALTER TABLE usuarios ADD COLUMN ${column.name} ${column.type}`);
            console.log(`Migração: Coluna ${column.name} adicionada.`);
        } catch (error) {
            console.log(`Migração: Coluna ${column.name} já existe ou erro ignorado.`);
        }
    });

    // Migração 2: Adicionar campos para PDFs na tabela recomendacoes
    try {
        window.db.run("ALTER TABLE recomendacoes ADD COLUMN tipo TEXT DEFAULT 'texto'");
        console.log('Migração: Coluna tipo adicionada à tabela recomendacoes.');
    } catch (error) {
        console.log('Migração: Coluna tipo já existe ou erro ignorado.');
    }

    try {
        window.db.run("ALTER TABLE recomendacoes ADD COLUMN arquivo_pdf TEXT");
        console.log('Migração: Coluna arquivo_pdf adicionada à tabela recomendacoes.');
    } catch (error) {
        console.log('Migração: Coluna arquivo_pdf já existe ou erro ignorado.');
    }

    // Migração 3: Inserir livros PDF no banco de dados
    insertPDFBooks();

    // Migração 4: Inserir usuários de exemplo
    insertSampleUsers();

    // Migração 5: Atualizar foto de perfil padrão para usuários existentes
    updateDefaultProfilePictures();

    // Salvar após migrações
    saveDatabase();
}

/**
 * Insere os livros PDF no banco de dados se não existirem
 */
function insertPDFBooks() {
    const pdfBooks = [
        {
            titulo: 'Auto da Barca do Inferno',
            arquivo: 'assets/pdf/Auto_da_Barca_do_Inferno.pdf',
            descricao: 'Auto da Barca do Inferno é uma obra de Gil Vicente, escrita em 1516.',
            nivel: 'intermediario',
            categoria: 'stories'
        },
        {
            titulo: 'Dom Casmurro',
            arquivo: 'assets/pdf/Dom_Casmurro.pdf',
            descricao: 'Romance de Machado de Assis publicado em 1899.',
            nivel: 'avancado',
            categoria: 'stories'
        },
        {
            titulo: 'Macunaíma',
            arquivo: 'assets/pdf/Macunaíma.pdf',
            descricao: 'Romance modernista de Mário de Andrade, publicado em 1928.',
            nivel: 'avancado',
            categoria: 'stories'
        },
        {
            titulo: 'Memórias Póstumas de Brás Cubas',
            arquivo: 'assets/pdf/memorias_postumas.pdf',
            descricao: 'Romance de Machado de Assis publicado em 1881.',
            nivel: 'avancado',
            categoria: 'stories'
        },
        {
            titulo: 'Niketche',
            arquivo: 'assets/pdf/niketche.pdf',
            descricao: 'Romance de Herculano de Carvalho Marques.',
            nivel: 'intermediario',
            categoria: 'stories'
        }
    ];

    pdfBooks.forEach(book => {
        try {
            // Verificar se o livro já existe
            const stmt = window.db.prepare('SELECT id FROM recomendacoes WHERE titulo = ? AND tipo = "pdf"');
            const result = stmt.getAsObject([book.titulo]);
            stmt.free();

            if (!result.id) {
                // Inserir o livro PDF
                const insertStmt = window.db.prepare(`
                    INSERT INTO recomendacoes (titulo, descricao, nivel, categoria, conteudo, tipo, arquivo_pdf, visualizacoes)
                    VALUES (?, ?, ?, ?, ?, 'pdf', ?, 0)
                `);
                insertStmt.run([book.titulo, book.descricao, book.nivel, book.categoria, '', book.arquivo]);
                insertStmt.free();
                console.log(`Livro PDF "${book.titulo}" inserido no banco de dados.`);
            } else {
                console.log(`Livro PDF "${book.titulo}" já existe no banco de dados.`);
            }
        } catch (error) {
            console.error(`Erro ao inserir livro PDF "${book.titulo}":`, error);
        }
    });
}

/**
 * Insere usuários de exemplo para testar o painel admin - CORRIGIDO
 */
function insertSampleUsers() {
    const sampleUsers = [
        {
            usuario: 'admin',
            email: 'admin@alfabit.com',
            data_nascimento: '1990-01-01',
            escolaridade: 'superior-completo',
            senha: 'admin123',
            telefone: '(11) 99999-9999',
            nome_completo: 'Administrador do Sistema',
            bio: 'Administrador responsável pelo sistema AlfaBit',
            localizacao: 'São Paulo, SP',
            website: 'https://alfabit.com',
            foto_perfil: 'assets/icon/admin.png',
            atividades_realizadas: 50,
            nivel_atual: 'avancado',
            pontos_experiencia: 1000,
            ultimo_acesso: new Date().toISOString().split('T')[0],
            nivel_atividade: 'alta',
            tipo_usuario: 'admin',
            meta_atividades: 100,
            data_meta: '2024-12-31'
        },
        {
            usuario: 'professor',
            email: 'professor@alfabit.com',
            data_nascimento: '1985-05-15',
            escolaridade: 'superior-completo',
            senha: 'prof123',
            telefone: '(11) 88888-8888',
            nome_completo: 'Professor Silva',
            bio: 'Professor de português e literatura',
            localizacao: 'Rio de Janeiro, RJ',
            website: 'https://professor.alfabit.com',
            foto_perfil: 'assets/icon/teacher.png',
            atividades_realizadas: 30,
            nivel_atual: 'intermediario',
            pontos_experiencia: 500,
            ultimo_acesso: new Date().toISOString().split('T')[0],
            nivel_atividade: 'media',
            tipo_usuario: 'professor',
            meta_atividades: 50,
            data_meta: '2024-12-31'
        },
        {
            usuario: 'aluno1',
            email: 'aluno1@alfabit.com',
            data_nascimento: '2005-03-20',
            escolaridade: 'medio-incompleto',
            senha: 'aluno123',
            telefone: '(11) 77777-7777',
            nome_completo: 'João Silva',
            bio: 'Estudante apaixonado por literatura',
            localizacao: 'São Paulo, SP',
            website: '',
            foto_perfil: 'assets/icon/user icon.png',
            atividades_realizadas: 10,
            nivel_atual: 'iniciante',
            pontos_experiencia: 100,
            ultimo_acesso: new Date().toISOString().split('T')[0],
            nivel_atividade: 'media',
            tipo_usuario: 'comum',
            meta_atividades: 20,
            data_meta: '2024-12-31'
        },
        {
            usuario: 'aluno2',
            email: 'aluno2@alfabit.com',
            data_nascimento: '2004-07-10',
            escolaridade: 'medio-incompleto',
            senha: 'aluno123',
            telefone: '(11) 66666-6666',
            nome_completo: 'Maria Santos',
            bio: 'Amante de histórias e leitura',
            localizacao: 'Belo Horizonte, MG',
            website: '',
            foto_perfil: 'assets/icon/user icon.png',
            atividades_realizadas: 15,
            nivel_atual: 'iniciante',
            pontos_experiencia: 150,
            ultimo_acesso: new Date().toISOString().split('T')[0],
            nivel_atividade: 'alta',
            tipo_usuario: 'comum',
            meta_atividades: 25,
            data_meta: '2024-12-31'
        }
    ];

    sampleUsers.forEach(user => {
        try {
            // Verificar se o usuário já existe
            const stmt = window.db.prepare('SELECT id FROM usuarios WHERE usuario = ? OR email = ?');
            const result = stmt.getAsObject([user.usuario, user.email]);
            stmt.free();

            if (!result.id) {
                // Inserir o usuário com todas as colunas
                const insertStmt = window.db.prepare(`
                    INSERT INTO usuarios (
                        usuario, email, data_nascimento, escolaridade, senha, telefone,
                        nome_completo, bio, localizacao, website, foto_perfil,
                        atividades_realizadas, nivel_atual, pontos_experiencia, ultimo_acesso,
                        nivel_atividade, tipo_usuario, meta_atividades, data_meta
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                
                insertStmt.run([
                    user.usuario, 
                    user.email, 
                    user.data_nascimento, 
                    user.escolaridade, 
                    user.senha, 
                    user.telefone,
                    user.nome_completo, 
                    user.bio, 
                    user.localizacao, 
                    user.website, 
                    user.foto_perfil,
                    user.atividades_realizadas, 
                    user.nivel_atual, 
                    user.pontos_experiencia, 
                    user.ultimo_acesso,
                    user.nivel_atividade, 
                    user.tipo_usuario, 
                    user.meta_atividades, 
                    user.data_meta
                ]);
                insertStmt.free();
                console.log(`✅ Usuário de exemplo "${user.usuario}" inserido no banco de dados.`);
            } else {
                console.log(`ℹ️ Usuário de exemplo "${user.usuario}" já existe no banco de dados.`);
                
                // Atualizar usuário existente se necessário
                updateExistingUser(user);
            }
        } catch (error) {
            console.error(`❌ Erro ao inserir usuário de exemplo "${user.usuario}":`, error);
            
            // Tentar inserção simplificada se a completa falhar
            insertSimplifiedUser(user);
        }
    });
}

/**
 * Atualiza usuário existente com dados faltantes
 */
function updateExistingUser(user) {
    try {
        // Verificar quais colunas existem e atualizar gradualmente
        const updates = [];
        const values = [];
        
        // Campos básicos que provavelmente existem
        if (user.nome_completo) {
            updates.push('nome_completo = ?');
            values.push(user.nome_completo);
        }
        
        if (user.bio) {
            updates.push('bio = ?');
            values.push(user.bio);
        }
        
        if (user.tipo_usuario) {
            updates.push('tipo_usuario = ?');
            values.push(user.tipo_usuario);
        }
        
        if (updates.length > 0) {
            values.push(user.usuario);
            const updateQuery = `UPDATE usuarios SET ${updates.join(', ')} WHERE usuario = ?`;
            const updateStmt = window.db.prepare(updateQuery);
            updateStmt.run(values);
            updateStmt.free();
            console.log(`🔄 Usuário "${user.usuario}" atualizado com sucesso.`);
        }
    } catch (error) {
        console.warn(`⚠️ Não foi possível atualizar usuário "${user.usuario}":`, error.message);
    }
}

/**
 * Insere usuário com estrutura mínima se a completa falhar
 */
function insertSimplifiedUser(user) {
    try {
        const simpleStmt = window.db.prepare(`
            INSERT INTO usuarios (usuario, email, data_nascimento, escolaridade, senha, telefone, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        simpleStmt.run([
            user.usuario,
            user.email,
            user.data_nascimento,
            user.escolaridade,
            user.senha,
            user.telefone,
            user.tipo_usuario || 'comum'
        ]);
        simpleStmt.free();
        console.log(`✅ Usuário simplificado "${user.usuario}" inserido com sucesso.`);
    } catch (error) {
        console.error(`💥 Falha crítica ao inserir usuário "${user.usuario}":`, error);
    }
}

/**
 * Atualiza a foto de perfil padrão para usuários existentes que ainda têm a foto antiga
 */
function updateDefaultProfilePictures() {
    try {
        // Atualizar apenas usuários que ainda têm a foto padrão antiga e não são admin/professor
        const updateStmt = window.db.prepare(`
            UPDATE usuarios
            SET foto_perfil = 'assets/icon/circle-user-round'
            WHERE foto_perfil = 'assets/icon/user icon.png'
            AND tipo_usuario = 'comum'
        `);
        const result = updateStmt.run();
        updateStmt.free();

        if (result.changes > 0) {
            console.log(`🔄 Migração: ${result.changes} usuários atualizados com a nova foto de perfil padrão.`);
        } else {
            console.log('ℹ️ Migração: Nenhum usuário precisava ser atualizado com a nova foto de perfil.');
        }
    } catch (error) {
        console.warn('⚠️ Migração: Não foi possível atualizar fotos de perfil padrão:', error.message);
    }
}

/**
 * Função para resetar o banco de dados (apenas para desenvolvimento)
 */
function resetDatabase() {
    if (window.db && confirm('Tem certeza que deseja resetar o banco de dados? Isso apagará todos os dados.')) {
        try {
            localStorage.removeItem('sqliteDb');
            window.db.close();
            window.db = null;
            console.log('🔄 Banco de dados resetado. Recarregue a página.');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Erro ao resetar banco de dados:', error);
        }
    }
}

// Expor função de reset para desenvolvimento
window.resetDatabase = resetDatabase;

// Garante que o banco de dados seja inicializado assim que o script for carregado
document.addEventListener('DOMContentLoaded', function() {
    initDatabase().then(db => {
        if (db) {
            console.log('✅ Banco de dados pronto para uso');
        } else {
            console.error('❌ Falha ao inicializar banco de dados');
        }
    });
});