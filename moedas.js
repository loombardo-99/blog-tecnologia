document.addEventListener('DOMContentLoaded', function() {
    const currencyContainer = document.getElementById('currency-rates-container');

    async function fetchCurrencyRates() {
        try {
            const response = await fetch('https://api.frankfurter.app/latest?from=BRL');
            const data = await response.json();

            if (data && data.rates) {
                let ratesHtml = '<h3>Taxas de Câmbio (Base: BRL)</h3><ul>';
                for (const currency in data.rates) {
                    ratesHtml += `<li>1 BRL = ${data.rates[currency].toFixed(4)} ${currency}</li>`;
                }
                ratesHtml += '</ul>';
                currencyContainer.innerHTML = ratesHtml;
            } else {
                currencyContainer.innerHTML = '<p>Não foi possível carregar as cotações das moedas.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar cotações de moedas:', error);
            currencyContainer.innerHTML = '<p>Erro ao carregar as cotações das moedas. Tente novamente mais tarde.</p>';
        }
    }

    fetchCurrencyRates();
});