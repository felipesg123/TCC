// ======================================================
// Biblioteca Virtual - Leitura Dinâmica
// ======================================================

// Inicializa PDF.js (para compatibilidade futura)
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// ======================================================
// Funções de Banco de Dados
// ======================================================

/**
 * Busca todas as recomendações de leitura do banco de dados
 */
async function buscarLivros() {
    if (!window.db) {
        console.error('Banco de dados não inicializado');
        return [];
    }

    try {
        const stmt = window.db.prepare('SELECT * FROM recomendacoes WHERE tipo != "pdf" ORDER BY created_at DESC');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        return [];
    }
}

/**
 * Busca livros PDF do banco de dados
 */
async function buscarLivrosPDF() {
    if (!window.db) {
        console.error('Banco de dados não inicializado');
        return [];
    }

    try {
        const stmt = window.db.prepare('SELECT * FROM recomendacoes WHERE tipo = "pdf" ORDER BY titulo ASC');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error('Erro ao buscar livros PDF:', error);
        return [];
    }
}

/**
 * Incrementa as visualizações de um livro
 */
async function incrementarVisualizacoes(livroId) {
    if (!window.db) return;

    try {
        const stmt = window.db.prepare('UPDATE recomendacoes SET visualizacoes = visualizacoes + 1 WHERE id = ?');
        stmt.run([livroId]);
        stmt.free();
        await saveDatabase();
    } catch (error) {
        console.error('Erro ao incrementar visualizações:', error);
    }
}

// ======================================================
// Funções de Interface
// ======================================================

/**
 * Gera thumbnail da primeira página do PDF
 */
async function gerarThumbnailPDF(pdfPath) {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 0.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        return canvas.toDataURL();
    } catch (error) {
        console.error('Erro ao gerar thumbnail do PDF:', error);
        return null;
    }
}

/**
 * Renderiza os livros na grid
 */
async function renderizarLivros(livros) {
    const grid = document.getElementById('books-grid');
    if (!grid) return;

    // Buscar livros PDF do banco de dados
    const livrosPDF = await buscarLivrosPDF();

    // Gerar thumbnails para PDFs
    for (let pdf of livrosPDF) {
        if (!pdf.capa_url) {
            pdf.capa_url = await gerarThumbnailPDF(pdf.arquivo_pdf);
        }
    }

    // Combinar livros do banco com PDFs
    const todosLivros = [...livrosPDF, ...livros];

    if (todosLivros.length === 0) {
        grid.innerHTML = '<div class="no-results">Nenhum livro encontrado</div>';
        return;
    }

    grid.innerHTML = todosLivros.map(livro => `
        <div class="special-card" data-book-id="${livro.id}" data-tipo="${livro.tipo || 'db'}">
            <div class="special-card-inner">
                <div class="book-cover">
                    ${livro.capa_url ? `<img src="${livro.capa_url}" alt="Capa do livro" class="book-cover-image">` : '📚'}
                </div>
            </div>
            <div class="card-text">
                <img src="assets/icon/opened-book-3163.png" alt="Ícone de livro" class="book-icon">
                <h3>${livro.titulo}</h3>
            </div>
        </div>
    `).join('');

    // Adiciona eventos de clique
    document.querySelectorAll('.special-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = card.getAttribute('data-book-id');
            const tipo = card.getAttribute('data-tipo');
            if (tipo === 'pdf') {
                abrirPDF(bookId);
            } else {
                abrirLivro(parseInt(bookId));
            }
        });
    });
}

/**
 * Abre um livro no modal
 */
async function abrirLivro(livroId) {
    const livros = await buscarLivros();
    const livro = livros.find(l => l.id === livroId);

    if (!livro) {
        alert('Livro não encontrado!');
        return;
    }

    // Incrementa visualizações
    await incrementarVisualizacoes(livroId);

    // Preenche o modal
    document.getElementById('book-modal-title').textContent = livro.titulo;
    document.getElementById('book-content').innerHTML = `
        <div class="book-info">
            <p><strong>Descrição:</strong> ${livro.descricao || 'Sem descrição'}</p>
            <p><strong>Nível:</strong> ${formatarNivel(livro.nivel)}</p>
            <p><strong>Categoria:</strong> ${formatarCategoria(livro.categoria)}</p>
            <p><strong>Visualizações:</strong> ${livro.visualizacoes || 0}</p>
        </div>
        <div class="book-text">
            ${livro.conteudo.replace(/\n/g, '<br>')}
        </div>
    `;

    // Mostra o modal
    document.getElementById('book-modal').style.display = 'flex';
}

/**
 * Abre um PDF no modal usando PDF.js
 */
async function abrirPDF(pdfId) {
    // Buscar o livro PDF do banco de dados
    const livrosPDF = await buscarLivrosPDF();
    const pdf = livrosPDF.find(p => p.id == pdfId);

    if (!pdf) {
        alert('PDF não encontrado!');
        return;
    }

    // Preenche o modal com o PDF renderizado
    document.getElementById('book-modal-title').textContent = pdf.titulo;
    document.getElementById('book-content').innerHTML = `
        <div class="pdf-container">
            <div id="pdf-viewer" style="width: 100%; height: 600px; overflow-y: auto;"></div>
        </div>
    `;

    // Renderiza o PDF usando PDF.js
    try {
        const loadingTask = pdfjsLib.getDocument(pdf.arquivo_pdf);
        const pdfDoc = await loadingTask.promise;

        const pdfViewer = document.getElementById('pdf-viewer');
        pdfViewer.innerHTML = ''; // Limpa o conteúdo anterior

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.marginBottom = '10px';
            canvas.style.border = '1px solid #ccc';

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            pdfViewer.appendChild(canvas);
        }
    } catch (error) {
        console.error('Erro ao renderizar PDF:', error);
        document.getElementById('book-content').innerHTML = `
            <div class="error-message">Erro ao carregar o PDF. <a href="${pdf.arquivo_pdf}" target="_blank">Clique aqui para baixar</a></div>
        `;
    }

    // Mostra o modal
    document.getElementById('book-modal').style.display = 'flex';
}

// ======================================================
// Funções Auxiliares
// ======================================================

function formatarNivel(nivel) {
    const niveis = {
        'iniciante': 'Iniciante',
        'intermediario': 'Intermediário',
        'avancado': 'Avançado'
    };
    return niveis[nivel] || nivel;
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

// ======================================================
// Inicialização
// ======================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializa o banco de dados
        await initDatabase();
        console.log('Banco de dados inicializado para leitura');

        // Carrega os livros
        const livros = await buscarLivros();
        renderizarLivros(livros);

        console.log('Página de leitura inicializada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar página de leitura:', error);
        document.getElementById('books-grid').innerHTML = '<div class="error-message">Erro ao carregar livros</div>';
    }
});

// ======================================================
// Eventos do Modal
// ======================================================

// Fechar modal
document.getElementById('close-book-modal')?.addEventListener('click', () => {
    document.getElementById('book-modal').style.display = 'none';
});

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
    const modal = document.getElementById('book-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
