document.addEventListener('DOMContentLoaded', function() {
    // --- Rolagem Suave ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                return;
            }
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- Lógica do Menu Hamburguer ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Lógica do Modo Escuro ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        if (darkModeToggle) {
            darkModeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

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
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Carregar Artigos Dinamicamente ---
    let allArticles = [];

    async function loadArticles(searchTerm = '') {
        try {
            if (allArticles.length === 0) {
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

            for (const key in sections) {
                if (sections[key]) {
                    sections[key].innerHTML = '';
                }
            }

            if (searchTerm) {
                const searchResultsContainer = document.querySelector('#ultimas-noticias .artigos-container');
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

    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadArticles();
    }

    // --- Lógica da Seção de Comentários (apenas para páginas de artigo) ---
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
        const commentForm = document.getElementById('comment-form');
        const commentsList = document.getElementById('comments-list');

        function getArticleIdFromUrl() {
            const pathParts = window.location.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName.replace('.html', '');
        }

        const articleId = getArticleIdFromUrl();

        function loadComments() {
            const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
            commentsList.innerHTML = '';

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

            loadComments();
        });

        loadComments();
    }

    // --- Integração de Moedas e Clima no News Ticker ---
    const newsTickerDisplay = document.getElementById('news-ticker-display');
    let tickerContent = [];
    let currentTickerIndex = 0;

    // Função para obter a descrição do tempo com base no código (copiada de clima.js)
    function getWeatherCodeDescription(code) {
        switch(code) {
            case 0: return 'Céu limpo';
            case 1: return 'Principalmente céu limpo';
            case 2: return 'Parcialmente nublado';
            case 3: return 'Nublado';
            case 45: return 'Nevoeiro';
            case 48: return 'Nevoeiro depositante';
            case 51: return 'Chuvisco leve';
            case 53: return 'Chuvisco moderado';
            case 55: return 'Chuvisco denso';
            case 56: return 'Chuvisco congelante leve';
            case 57: return 'Chuvisco congelante denso';
            case 61: return 'Chuva leve';
            case 63: return 'Chuva moderada';
            case 65: return 'Chuva forte';
            case 66: return 'Chuva congelante leve';
            case 67: return 'Chuva congelante forte';
            case 71: return 'Queda de neve leve';
            case 73: return 'Queda de neve moderada';
            case 75: return 'Queda de neve forte';
            case 77: return 'Grãos de neve';
            case 80: return 'Pancadas de chuva leve';
            case 81: return 'Pancadas de chuva moderada';
            case 82: return 'Pancadas de chuva violenta';
            case 85: return 'Pancadas de neve leve';
            case 86: return 'Pancadas de neve forte';
            case 95: return 'Trovoada leve ou moderada';
            case 96: return 'Trovoada com granizo leve';
            case 99: return 'Trovoada com granizo forte';
            default: return 'Desconhecido';
        }
    }

    // Função para buscar cotações de moedas (adaptada de moedas.js)
    async function fetchCurrencyRatesForTicker() {
        try {
            const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BRL,EUR,GBP');
            const data = await response.json();

            if (data && data.rates) {
                const brlRate = data.rates['BRL'] ? data.rates['BRL'].toFixed(2) : 'N/A';
                const eurRate = data.rates['EUR'] ? data.rates['EUR'].toFixed(2) : 'N/A';
                const gbpRate = data.rates['GBP'] ? data.rates['GBP'].toFixed(2) : 'N/A';
                
                tickerContent.push(`Dólar: R$ ${brlRate} | Euro: € ${eurRate} | Libra: £ ${gbpRate}`);
            }
        } catch (error) {
            console.error('Erro ao buscar cotações para o ticker:', error);
        }
    }

    // Função para buscar previsão do tempo (adaptada de clima.js)
    async function fetchWeatherForTicker(city = 'São Paulo') {
        try {
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                console.error('Cidade não encontrada para o ticker:', city);
                return;
            }

            const { latitude, longitude, name } = geoData.results[0];

            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&timezone=auto`);
            const weatherData = await weatherResponse.json();

            if (weatherData && weatherData.current_weather) {
                const { temperature, weathercode } = weatherData.current_weather;
                const weatherCodeDescription = getWeatherCodeDescription(weathercode);
                tickerContent.push(`Clima em ${name}: ${temperature}°C, ${weatherCodeDescription}`);
            }
        } catch (error) {
            console.error('Erro ao buscar clima para o ticker:', error);
        }
    }

    // Função para atualizar o conteúdo do news ticker
    async function updateNewsTicker() {
        tickerContent = []; // Limpa o conteúdo anterior
        await fetchCurrencyRatesForTicker();
        await fetchWeatherForTicker('São Paulo'); // Cidade padrão para o clima
        // Adicione mais itens ao ticker aqui, se desejar
        // tickerContent.push('Última Notícia: Nova tecnologia de baterias promete revolucionar veículos elétricos!');

        if (tickerContent.length > 0) {
            const innerTicker = document.createElement('div');
            innerTicker.classList.add('news-ticker-inner');
            
            // Duplica o conteúdo para criar o efeito de rolagem contínua
            const duplicatedContent = tickerContent.map(item => `<span class="news-ticker-item">${item}</span>`).join(' ');
            innerTicker.innerHTML = duplicatedContent + ' ' + duplicatedContent; // Duplica para rolagem infinita

            newsTickerDisplay.innerHTML = ''; // Limpa o display antes de adicionar o novo conteúdo
            newsTickerDisplay.appendChild(innerTicker);

            // Ajusta a velocidade da animação com base no número de itens
            const animationDuration = tickerContent.length * 10; // 10 segundos por item
            innerTicker.style.animationDuration = `${animationDuration}s`;

        } else {
            newsTickerDisplay.innerHTML = '<div class="news-ticker-inner"><span class="news-ticker-item">Carregando informações...</span></div>';
        }
    }

    // Chama a função para atualizar o ticker ao carregar a página
    updateNewsTicker();
    // Atualiza o ticker a cada 5 minutos (300000 ms)
    setInterval(updateNewsTicker, 300000);
});
