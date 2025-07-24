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
            // updateCurrencyDisplay(); // Atualiza a exibição das moedas com as novas configurações
        });

        window.addEventListener('click', (event) => {
            if (event.target == currencySettingsModal) {
                currencySettingsModal.style.display = 'none';
            }
        });
    }

    // Atualiza ao carregar a página, apenas se os elementos existirem
    // if (currencyDisplay) {
    //     updateCurrencyDisplay();
    //     setInterval(updateCurrencyDisplay, 300000);
    // }
    // if (weatherDisplay) {
    //     updateWeatherDisplay();
    //     setInterval(updateWeatherDisplay, 300000);
    // }
    
    // Chama renderNewsTicker para o plantão de notícias
    // renderNewsTicker();
});