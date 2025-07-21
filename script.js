document.addEventListener('DOMContentLoaded', function() {
    // --- Rolagem Suave ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- Lógica do Menu Hamburguer ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fechar o menu ao clicar em um link (para rolagem suave)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Lógica do Modo Escuro ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Função para aplicar o tema
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        if (darkModeToggle) {
            darkModeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Carregar o tema salvo ou detectar a preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Alternar tema ao clicar no botão
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Botão Voltar ao Topo ---
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Mostra o botão após rolar 300px
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Carregar Artigos Dinamicamente ---
    let allArticles = []; // Armazenar todos os artigos carregados

    async function loadArticles(searchTerm = '') {
        try {
            if (allArticles.length === 0) { // Carregar artigos apenas uma vez
                const response = await fetch('articles.json');
                allArticles = await response.json();
            }

            const filteredArticles = allArticles.filter(article => 
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.summary.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const sections = {
                'ultimas-noticias': document.querySelector('#ultimas-noticias .artigos-container'),
                'analises': document.querySelector('#analises .artigos-container'),
                'opiniao': document.querySelector('#opiniao .artigos-container'),
                'multimidia': document.querySelector('#multimidia .artigos-container')
            };

            // Limpar os contêineres existentes
            for (const key in sections) {
                if (sections[key]) {
                    sections[key].innerHTML = '';
                }
            }

            if (searchTerm) { // Se houver termo de busca, exibe todos os resultados em uma única seção
                const searchResultsContainer = document.querySelector('#ultimas-noticias .artigos-container'); // Usar a primeira seção para resultados de busca
                if (searchResultsContainer) {
                    if (filteredArticles.length === 0) {
                        searchResultsContainer.innerHTML = '<p>Nenhum artigo encontrado para a sua busca.</p>';
                    } else {
                        filteredArticles.forEach(article => {
                            const articleHtml = `
                                <article class="card">
                                    <img src="${article.image}" alt="${article.title}">
                                    <h3>${article.title}</h3>
                                    <p>${article.summary}</p>
                                    <a href="${article.link}" class="read-more">Leia Mais</a>
                                </article>
                            `;
                            searchResultsContainer.insertAdjacentHTML('beforeend', articleHtml);
                        });
                    }
                }
            } else { // Se não houver termo de busca, distribui pelos containers originais
                filteredArticles.forEach(article => {
                    const articleHtml = `
                        <article class="card">
                            <img src="${article.image}" alt="${article.title}">
                            <h3>${article.title}</h3>
                            <p>${article.summary}</p>
                            <a href="${article.link}" class="read-more">Leia Mais</a>
                        </article>
                    `;
                    if (sections[article.category]) {
                        sections[article.category].insertAdjacentHTML('beforeend', articleHtml);
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao carregar ou filtrar os artigos:', error);
        }
    }

    // --- Lógica da Barra de Busca ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        loadArticles(searchTerm);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value;
            loadArticles(searchTerm);
        }
    });

    // Chamar a função para carregar os artigos quando o DOM estiver pronto (sem termo de busca inicial)
    // Apenas carrega artigos na página principal (index.html)
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadArticles();
    }

    // --- Lógica da Seção de Comentários (apenas para páginas de artigo) ---
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
        const commentForm = document.getElementById('comment-form');
        const commentsList = document.getElementById('comments-list');

        // Função para obter o ID do artigo da URL
        function getArticleIdFromUrl() {
            const pathParts = window.location.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName.replace('.html', '');
        }

        const articleId = getArticleIdFromUrl();

        // Carregar comentários existentes
        function loadComments() {
            const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
            commentsList.innerHTML = ''; // Limpa a lista antes de recarregar

            if (comments.length === 0) {
                commentsList.innerHTML = '<p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
            } else {
                comments.forEach(comment => {
                    const commentHtml = `
                        <div class="comment-item">
                            <strong>${comment.name}</strong>
                            <p>${comment.text}</p>
                            <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
                        </div>
                    `;
                    commentsList.insertAdjacentHTML('beforeend', commentHtml);
                });
            }
        }

        // Salvar novo comentário
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('comment-name');
            const textInput = document.getElementById('comment-text');

            const newComment = {
                name: nameInput.value,
                text: textInput.value,
                date: new Date().toISOString()
            };

            const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
            comments.push(newComment);
            localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));

            nameInput.value = '';
            textInput.value = '';

            loadComments(); // Recarrega os comentários para exibir o novo
        });

        // Carregar comentários ao carregar a página do artigo
        loadComments();
    }
});