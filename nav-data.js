document.addEventListener('DOMContentLoaded', function() {
    const currencyDisplay = document.getElementById('currency-display');
    const weatherDisplay = document.getElementById('weather-display');
    const newsTickerDisplay = document.getElementById('news-ticker-display');
    const currencySettingsBtn = document.getElementById('currency-settings-btn');
    const currencySettingsModal = document.getElementById('currency-settings-modal');
    const closeButton = currencySettingsModal ? currencySettingsModal.querySelector('.close-button') : null;
    const saveCurrencySettingsBtn = document.getElementById('save-currency-settings');
    const currencyCheckboxes = currencySettingsModal ? currencySettingsModal.querySelectorAll('.currency-options input[type="checkbox"]') : null;

    // Função para obter a descrição do tempo com base no código
    function getWeatherIconAndDescription(code) {
        switch(code) {
            case 0: return { icon: '☀️', description: 'Céu limpo' };
            case 1: return { icon: '🌤️', description: 'Principalmente céu limpo' };
            case 2: return { icon: '⛅', description: 'Parcialmente nublado' };
            case 3: return { icon: '☁️', description: 'Nublado' };
            case 45: return { icon: '🌫️', description: 'Nevoeiro' };
            case 48: return { icon: '🌫️', description: 'Nevoeiro depositante' };
            case 51: return { icon: '🌧️', description: 'Chuvisco leve' };
            case 53: return { icon: '🌧️', description: 'Chuvisco moderado' };
            case 55: return { icon: '🌧️', description: 'Chuvisco denso' };
            case 56: return { icon: '🌨️', description: 'Chuvisco congelante leve' };
            case 57: return { icon: '🌨️', description: 'Chuvisco congelante denso' };
            case 61: return { icon: '☔', description: 'Chuva leve' };
            case 63: return { icon: '☔', description: 'Chuva moderada' };
            case 65: return { icon: '☔', description: 'Chuva forte' };
            case 66: return { icon: '🌨️', description: 'Chuvisco congelante leve' };
            case 67: return { icon: '🌨️', description: 'Chuvisco congelante forte' };
            case 71: return { icon: '❄️', description: 'Queda de neve leve' };
            case 73: return { icon: '❄️', description: 'Queda de neve moderada' };
            case 75: return { icon: '❄️', description: 'Queda de neve forte' };
            case 77: return { icon: '🌨️', description: 'Grãos de neve' };
            case 80: return { icon: '⛈️', description: 'Pancadas de chuva leve' };
            case 81: return { icon: '⛈️', description: 'Pancadas de chuva moderada' };
            case 82: return { icon: '⛈️', description: 'Pancadas de chuva violenta' };
            case 85: return { icon: '🌨️', description: 'Pancadas de neve leve' };
            case 86: return { icon: '🌨️', description: 'Pancadas de neve forte' };
            case 95: return { icon: '⚡', description: 'Trovoada leve ou moderada' };
            case 96: return { icon: '⚡', description: 'Trovoada com granizo leve' };
            case 99: return { icon: '⚡', description: 'Trovoada com granizo forte' };
            default: return { icon: '❓', description: 'Desconhecido' };
        }
    }

    // Função para formatar a data para a API
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Função para atualizar as cotações de moedas
    async function updateCurrencyDisplay() {
        if (!currencyDisplay) return; // Garante que o elemento existe
        currencyDisplay.innerHTML = 'Carregando...';
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            const todayDate = formatDate(today);
            const yesterdayDate = formatDate(yesterday);

            const selectedCurrencies = JSON.parse(localStorage.getItem('selectedCurrencies')) || ['USD', 'EUR'];
            const fetchPromises = [];

            selectedCurrencies.forEach(currency => {
                fetchPromises.push(fetch(`https://api.frankfurter.app/${todayDate}?from=${currency}&to=BRL`));
                fetchPromises.push(fetch(`https://api.frankfurter.app/${yesterdayDate}?from=${currency}&to=BRL`));
            });

            const responses = await Promise.all(fetchPromises);
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await Promise.all(responses.map(res => res.json()));

            let currencyHtml = '';
            let dataIndex = 0;

            selectedCurrencies.forEach(currency => {
                const todayData = data[dataIndex++];
                const yesterdayData = data[dataIndex++];

                if (todayData && todayData.rates && yesterdayData && yesterdayData.rates) {
                    const todayRate = todayData.rates.BRL;
                    const yesterdayRate = yesterdayData.rates.BRL;

                    let changeIcon = '';
                    let changeClass = '';
                    let changePercent = 0;

                    if (todayRate > yesterdayRate) {
                        changeIcon = '▲';
                        changeClass = 'currency-up';
                        changePercent = ((todayRate - yesterdayRate) / yesterdayRate * 100).toFixed(2);
                    } else if (todayRate < yesterdayRate) {
                        changeIcon = '▼';
                        changeClass = 'currency-down';
                        changePercent = ((yesterdayRate - todayRate) / yesterdayRate * 100).toFixed(2);
                    } else {
                        changeIcon = '-';
                        changeClass = '';
                    }

                    currencyHtml += `
                        <span class="currency-item" title="Ontem: ${currency}/BRL ${yesterdayRate.toFixed(2)}">
                            ${currency}/BRL: ${todayRate.toFixed(2)} <span class="${changeClass}">${changeIcon} ${changePercent}%</span>
                        </span>
                    `;
                }
            });

            currencyDisplay.innerHTML = currencyHtml;

            // Adiciona a classe 'animated' para disparar a animação
            currencyDisplay.querySelectorAll('.currency-item span').forEach(span => {
                if (span.classList.contains('currency-up') || span.classList.contains('currency-down')) {
                    span.classList.add('animated');
                }
            });

        } catch (error) {
            console.error('Erro ao buscar cotações de moedas:', error);
            currencyDisplay.innerHTML = `Erro: ${error.message}`;
        }
    }

    // Função para atualizar a previsão do tempo
    async function updateWeatherDisplay() {
        if (!weatherDisplay) return; // Garante que o elemento existe
        weatherDisplay.innerHTML = 'Carregando...';
        const city = localStorage.getItem('lastCity') || 'Sao Paulo'; // Pega a última cidade ou usa São Paulo
        try {
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`);
            if (!geoResponse.ok) {
                throw new Error(`HTTP error! status: ${geoResponse.status}`);
            }
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                weatherDisplay.innerHTML = `Cidade não encontrada`;
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`);
            if (!weatherResponse.ok) {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();

            if (weatherData && weatherData.current_weather) {
                const { temperature, weathercode, windspeed, relativehumidity_2m } = weatherData.current_weather;
                const { icon, description } = getWeatherIconAndDescription(weathercode);
                
                weatherDisplay.innerHTML = `
                    <span class="weather-item" title="${description} | Vento: ${windspeed} km/h | Umidade: ${relativehumidity_2m}%" onclick="window.location.href='clima.html?city=${encodeURIComponent(name)}'">
                        ${icon} ${temperature}°C (${name})
                    </span>
                `;
            } else {
                weatherDisplay.innerHTML = `Erro: Dados inválidos`;
            }
        } catch (error) {
            console.error('Erro ao buscar previsão do tempo:', error);
            weatherDisplay.innerHTML = `Erro: ${error.message}`;
        }
    }

    // --- Plantão de Notícias (News Ticker) ---
    const newsItems = [
        { title: 'IA: O Futuro é Agora!', link: 'artigos/o-futuro-da-ia.html' },
        { title: 'Cibersegurança: Proteja Seus Dados!', link: 'artigos/ciberseguranca-em-2025.html' },
        { title: 'Metaverso: Realidade ou Ficção?', link: 'artigos/metaverso-realidade-ou-ficcao.html' },
        { title: 'Computação Quântica: O Próximo Salto!', link: 'artigos/computacao-quantica.html' },
        { title: 'Review: Novo Smartphone X!', link: 'artigos/review-smartphone-x.html' },
        { title: 'Software de Produtividade: Qual Escolher?', link: 'artigos/software-produtividade.html' },
        { title: 'Dilema Ético da IA: O Debate!', link: 'artigos/dilema-etico-ia.html' },
        { title: 'Trabalho do Futuro: Automação e Habilidades!', link: 'artigos/trabalho-do-futuro.html' },
        { title: 'Podcast: Entrevista com CEO da TechCorp!', link: 'artigos/podcast-ceo-techcorp.html' },
        { title: 'Galeria: Gadgets Inovadores 2025!', link: 'artigos/galeria-gadgets.html' },
        { title: 'Novas Tendências em Desenvolvimento Web: O que esperar em 2025!', link: 'artigos/artigo1.html' },
        { title: 'Blockchain além das Criptomoedas: Aplicações Revolucionárias!', link: 'artigos/artigo2.html' },
        { title: 'Realidade Virtual e Aumentada: Imersão Total no Entretenimento!', link: 'artigos/metaverso-realidade-ou-ficcao.html' },
        { title: 'Carros Autônomos: A Revolução nas Ruas está Próxima!', link: 'artigos/trabalho-do-futuro.html' },
        { title: 'Energias Renováveis e Tecnologia: O Futuro Sustentável!', link: 'artigos/o-futuro-da-ia.html' },
        { title: 'Saúde Digital: Como a Tecnologia está Transformando a Medicina!', link: 'artigos/dilema-etico-ia.html' },
        { title: 'Big Data e Análise Preditiva: O Poder dos Dados!', link: 'artigos/ciberseguranca-em-2025.html' },
        { title: 'Robótica Avançada: Automação em Todos os Setores!', link: 'artigos/trabalho-do-futuro.html' },
        { title: 'Smart Cities: Cidades Inteligentes para um Futuro Melhor!', link: 'artigos/metaverso-realidade-ou-ficcao.html' },
        { title: 'Gaming em Nuvem: O Fim dos Consoles Tradicionais?', link: 'artigos/review-smartphone-x.html' }
    ];

    function renderNewsTicker() {
        if (newsTickerDisplay) {
            let allNewsHtml = '';
            // Duplica as notícias para garantir um loop contínuo
            const duplicatedNewsItems = [...newsItems, ...newsItems]; 

            duplicatedNewsItems.forEach(news => {
                allNewsHtml += `<a href="${news.link}" class="news-ticker-item">🚨 ${news.title}</a>`;
            });

            newsTickerDisplay.innerHTML = `<div class="news-ticker-inner">${allNewsHtml}</div>`;
        }
    }

    // --- Lógica do Modal de Configurações de Moedas ---
    if (currencySettingsBtn && currencySettingsModal && closeButton && saveCurrencySettingsBtn && currencyCheckboxes) {
        currencySettingsBtn.addEventListener('click', () => {
            currencySettingsModal.style.display = 'block';
            // Carregar as moedas selecionadas no modal
            const savedSelectedCurrencies = JSON.parse(localStorage.getItem('selectedCurrencies')) || ['USD', 'EUR'];
            currencyCheckboxes.forEach(checkbox => {
                checkbox.checked = savedSelectedCurrencies.includes(checkbox.value);
            });
        });

        closeButton.addEventListener('click', () => {
            currencySettingsModal.style.display = 'none';
        });

        saveCurrencySettingsBtn.addEventListener('click', () => {
            const newSelectedCurrencies = [];
            currencyCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    newSelectedCurrencies.push(checkbox.value);
                }
            });
            localStorage.setItem('selectedCurrencies', JSON.stringify(newSelectedCurrencies));
            currencySettingsModal.style.display = 'none';
            updateCurrencyDisplay(); // Atualiza a exibição das moedas com as novas configurações
        });

        window.addEventListener('click', (event) => {
            if (event.target == currencySettingsModal) {
                currencySettingsModal.style.display = 'none';
            }
        });
    }

    // Atualiza ao carregar a página, apenas se os elementos existirem
    if (currencyDisplay) {
        updateCurrencyDisplay();
        setInterval(updateCurrencyDisplay, 300000);
    }
    if (weatherDisplay) {
        updateWeatherDisplay();
        setInterval(updateWeatherDisplay, 300000);
    }
    
    // Chama renderNewsTicker para o plantão de notícias
    renderNewsTicker();
});