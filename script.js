const proxyUrl = "https://api.allorigins.win/get?url=";

async function fetchStockData(symbol) {
    console.log(`Fetching data for ${symbol}...`);
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`;
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
        if (!response.ok) throw new Error("Errore nel caricamento dati");

        const rawData = await response.json();
        const data = JSON.parse(rawData.contents);

        if (!data.chart || !data.chart.result) throw new Error("Dati non disponibili");

        const stockData = data.chart.result[0];
        const timestamps = stockData.timestamp;
        const prices = stockData.indicators.quote[0].close;

        updateStockInfo(symbol, prices[prices.length - 1]);
        updateChart(timestamps, prices);
    } catch (error) {
        console.error("Errore nel recupero dati:", error);
        document.getElementById("stock-price").innerText = "Errore nel caricamento";
    }
}

function updateStockInfo(symbol, price) {
    document.getElementById("stock-name").innerText = symbol;
    document.getElementById("stock-price").innerText = `Prezzo: ${price.toFixed(2)} $`;
    document.getElementById("stock-price").style.color = "lime";
}

let stockChart;
function updateChart(timestamps, prices) {
    if (stockChart) stockChart.destroy();

    const ctx = document.getElementById('stockChart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps.map(t => new Date(t * 1000).toLocaleTimeString()),
            datasets: [{
                label: 'Prezzo',
                data: prices,
                borderColor: prices[0] < prices[prices.length - 1] ? 'lime' : 'red',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { color: '#444' }, ticks: { color: 'white' } },
                y: { grid: { color: '#444' }, ticks: { color: 'white' } }
            }
        }
    });
}
