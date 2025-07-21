document.addEventListener('DOMContentLoaded', function() {
    const weatherContainer = document.getElementById('weather-container');
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');

    // Função para obter a descrição do tempo com base no código
    function getWeatherCodeDescription(code) {
        // Códigos de tempo da Open-Meteo: https://www.open-meteo.com/en/docs
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

    async function fetchWeather(city) {
        if (!city) {
            weatherContainer.innerHTML = '<p>Por favor, digite o nome de uma cidade.</p>';
            return;
        }
        weatherContainer.innerHTML = '<p>Carregando previsão do tempo...</p>';
        try {
            // Usando a API Open-Meteo para dados de geocodificação (latitude e longitude)
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                weatherContainer.innerHTML = '<p>Cidade não encontrada. Verifique o nome e tente novamente.</p>';
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // Usando a API Open-Meteo para dados de clima
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`);
            const weatherData = await weatherResponse.json();

            if (weatherData && weatherData.current_weather) {
                const { temperature, windspeed, weathercode, is_day } = weatherData.current_weather;
                const weatherCodeDescription = getWeatherCodeDescription(weathercode);
                const dayNight = is_day ? 'Dia' : 'Noite';

                weatherContainer.innerHTML = `
                    <h3>Clima em ${name}, ${country}</h3>
                    <p>Temperatura: ${temperature}°C</p>
                    <p>Vento: ${windspeed} km/h</p>
                    <p>Condição: ${weatherCodeDescription} (${dayNight})</p>
                `;
                localStorage.setItem('lastCity', city); // Salva a última cidade pesquisada
            } else {
                weatherContainer.innerHTML = '<p>Não foi possível carregar a previsão do tempo para esta cidade.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar previsão do tempo:', error);
            weatherContainer.innerHTML = '<p>Erro ao carregar a previsão do tempo. Tente novamente mais tarde.</p>';
        }
    }

    getWeatherBtn.addEventListener('click', () => {
        fetchWeather(cityInput.value);
    });

    // Tenta buscar o clima para a última cidade pesquisada ou uma cidade padrão ao carregar a página
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');

    if (cityFromUrl) {
        cityInput.value = cityFromUrl;
        fetchWeather(cityFromUrl);
    } else {
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            cityInput.value = lastCity;
            fetchWeather(lastCity);
        } else {
            fetchWeather('São Paulo');
        }
    }
});