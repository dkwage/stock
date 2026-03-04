// Data Models and Constants
const INDICES = {
    "KOSPI": "^KS11",
    "NASDAQ": "^IXIC",
    "S&P 500": "^GSPC"
};

const DEFAULT_STATE = {
    endDate: new Date().toISOString().split('T')[0],
    indexColors: {
        "KOSPI": "#aaaaaa",
        "NASDAQ": "#34C759", // Default green
        "S&P 500": "#FF2D55" // Default red/pink
    },
    portfolios: [
        {
            id: 'dk_portfolio',
            name: 'DK Portfolio',
            startDate: '2025-10-07',
            color: '#FF9500',
            assets: { "QQQM": 0.45, "SMH": 0.15, "SPYM": 0.10, "JEPQ": 0.10, "IAU": 0.10, "DBMF": 0.10 }
        },
        {
            id: 'js_portfolio',
            name: 'JS Portfolio',
            startDate: '2025-03-01',
            color: '#5856D6',
            assets: { "SCHD": 0.33, "SPYM": 0.67 }
        }
    ]
};

// State Management
let appState = JSON.parse(localStorage.getItem('jusiktrack_state'));
if (!appState || !appState.portfolios) {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
}
// Migrate old state if indexColors missing
if (!appState.indexColors) {
    appState.indexColors = JSON.parse(JSON.stringify(DEFAULT_STATE.indexColors));
}
// Always reset end date to today's date upon every new visit/re-load
appState.endDate = new Date().toISOString().split('T')[0];

appState.portfolios.forEach(p => {
    if (!p.color) p.color = '#FFFFFF'; // default fallback for older localstorage
});

function saveState() {
    localStorage.setItem('jusiktrack_state', JSON.stringify(appState));
}

// Utilities
function dateToUnix(dateStr) {
    return Math.floor(new Date(dateStr).getTime() / 1000);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getEarliestDate() {
    const dates = appState.portfolios.map(p => p.startDate);
    if (dates.length === 0) return appState.endDate; // fallback
    return dates.sort()[0];
}

// DOM Setup
document.addEventListener('DOMContentLoaded', () => {
    updateDateRangeText();
    setupConfigModal();
    initApp();
});

function updateDateRangeText() {
    const earliestStart = getEarliestDate();
    const portNames = appState.portfolios.map(p => p.name).join(', ');
    const textEl = document.getElementById('date-range-text');
    if (appState.portfolios.length > 0) {
        textEl.innerHTML = `Tracking performance for <strong>${portNames}</strong> up to <strong>${appState.endDate}</strong>`;
    } else {
        textEl.innerHTML = `No portfolios configured. Please add one in Settings.`;
    }
}

// Config Modal Logic
function setupConfigModal() {
    const modal = document.getElementById('config-modal');
    const configBtn = document.getElementById('config-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const applyBtn = document.getElementById('apply-config-btn');

    // Open Modal
    configBtn.addEventListener('click', () => {
        populateModal();
        modal.style.display = 'flex';
    });

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetPortfolioForm();
    });

    // Apply Changes
    applyBtn.addEventListener('click', () => {
        appState.endDate = document.getElementById('global-end-date').value;
        appState.indexColors = {
            "KOSPI": document.getElementById('color-kospi').value,
            "NASDAQ": document.getElementById('color-nasdaq').value,
            "S&P 500": document.getElementById('color-sp500').value
        };
        saveState();
        modal.style.display = 'none';

        // Re-init App
        updateDateRangeText();
        initApp();
    });

    // Add Asset Button
    document.getElementById('add-asset-btn').addEventListener('click', () => {
        addAssetRow();
    });

    // Handle Form Submit (Save Portfolio)
    document.getElementById('portfolio-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePortfolioFromForm();
    });

    // Cancel Edit
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        resetPortfolioForm();
    });
}

function populateModal() {
    document.getElementById('global-end-date').value = appState.endDate;
    document.getElementById('color-kospi').value = appState.indexColors["KOSPI"] || "#aaaaaa";
    document.getElementById('color-nasdaq').value = appState.indexColors["NASDAQ"] || "#34C759";
    document.getElementById('color-sp500').value = appState.indexColors["S&P 500"] || "#FF2D55";
    renderPortfolioList();
}

function renderPortfolioList() {
    const list = document.getElementById('portfolio-list');
    list.innerHTML = '';

    if (appState.portfolios.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No portfolios added.</p>';
        return;
    }

    appState.portfolios.forEach(port => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';

        const assetsCount = Object.keys(port.assets).length;

        item.innerHTML = `
            <div class="portfolio-info">
                <strong>${port.name}</strong>
                <span>Starts: ${port.startDate} | ${assetsCount} Assets</span>
            </div>
            <div class="portfolio-actions">
                <button class="btn btn-secondary edit-port-btn" data-id="${port.id}">Edit</button>
                <button class="btn btn-danger delete-port-btn" data-id="${port.id}">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });

    // Attach list event listeners
    document.querySelectorAll('.edit-port-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editPortfolio(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-port-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deletePortfolio(e.target.dataset.id));
    });
}

function addAssetRow(ticker = '', weight = '') {
    const container = document.getElementById('assets-container');
    const row = document.createElement('div');
    row.className = 'asset-row';
    row.innerHTML = `
        <input type="text" class="form-control ticker-input" placeholder="Ticker (e.g. AAPL)" value="${ticker}" required>
        <input type="number" step="0.01" min="0" max="1" class="form-control weight-input" placeholder="Weight (0.0 - 1.0)" value="${weight}" required>
        <button type="button" class="btn btn-danger remove-asset-btn">&times;</button>
    `;
    container.appendChild(row);

    row.querySelector('.remove-asset-btn').addEventListener('click', () => {
        row.remove();
    });
}

function resetPortfolioForm() {
    document.getElementById('portfolio-form').reset();
    document.getElementById('edit-portfolio-id').value = '';
    document.getElementById('port-color').value = '#FF9500';
    document.getElementById('form-title').innerText = 'Add New Portfolio';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('weight-warning').style.display = 'none';

    const container = document.getElementById('assets-container');
    container.innerHTML = '';
    // Add one empty row
    addAssetRow();
}

function editPortfolio(id) {
    const port = appState.portfolios.find(p => p.id === id);
    if (!port) return;

    document.getElementById('edit-portfolio-id').value = port.id;
    document.getElementById('port-name').value = port.name;
    document.getElementById('port-start-date').value = port.startDate;
    document.getElementById('port-color').value = port.color || '#FFFFFF';
    document.getElementById('form-title').innerText = 'Edit Portfolio';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    document.getElementById('weight-warning').style.display = 'none';

    const container = document.getElementById('assets-container');
    container.innerHTML = '';

    for (const [ticker, weight] of Object.entries(port.assets)) {
        addAssetRow(ticker, weight);
    }
}

function deletePortfolio(id) {
    if (confirm('Are you sure you want to delete this portfolio?')) {
        appState.portfolios = appState.portfolios.filter(p => p.id !== id);
        saveState();
        renderPortfolioList();
    }
}

function savePortfolioFromForm() {
    const idField = document.getElementById('edit-portfolio-id').value;
    const name = document.getElementById('port-name').value.trim();
    const startDate = document.getElementById('port-start-date').value;
    const color = document.getElementById('port-color').value;

    const tickerInputs = document.querySelectorAll('.ticker-input');
    const weightInputs = document.querySelectorAll('.weight-input');

    if (tickerInputs.length === 0) {
        alert("Please add at least one asset.");
        return;
    }

    let totalWeight = 0;
    const assets = {};

    for (let i = 0; i < tickerInputs.length; i++) {
        const t = tickerInputs[i].value.trim().toUpperCase();
        const w = parseFloat(weightInputs[i].value);
        if (t && !isNaN(w)) {
            assets[t] = w;
            totalWeight += w;
        }
    }

    // Validate Weights
    if (Math.abs(totalWeight - 1.0) > 0.001) {
        const warning = document.getElementById('weight-warning');
        warning.style.display = 'block';
        warning.innerText = `Total weight must be 1.0 (100%). Current sum: ${totalWeight.toFixed(3)}`;
        return;
    }

    document.getElementById('weight-warning').style.display = 'none';

    if (idField) {
        // Update existing
        const index = appState.portfolios.findIndex(p => p.id === idField);
        if (index !== -1) {
            appState.portfolios[index] = { id: idField, name, startDate, color, assets };
        }
    } else {
        // Create new
        appState.portfolios.push({ id: generateId(), name, startDate, color, assets });
    }

    saveState();
    resetPortfolioForm();
    renderPortfolioList();
}


// --- Main App Logic ---

async function fetchTickerData(ticker, startDate) {
    const period1 = dateToUnix(startDate);
    // Use appState.endDate for ending period
    const endDateObj = new Date(appState.endDate);
    const period2 = Math.floor(endDateObj.getTime() / 1000) + 86400; // Add 1 day to include end date

    const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(yfUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        const result = data.chart?.result?.[0];
        if (!result) return { ticker, data: {} };

        const timestamps = result.timestamp || [];
        const adjclose = result.indicators.adjclose?.[0]?.adjclose;
        const closes = result.indicators.quote[0].close;
        const pricesToUse = adjclose || closes;

        const series = {};
        for (let i = 0; i < timestamps.length; i++) {
            const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
            const price = pricesToUse[i];
            if (price !== null && price !== undefined) {
                series[date] = price;
            }
        }
        return { ticker, data: series };
    } catch (error) {
        console.error(`Error fetching ${ticker}:`, error);
        return { ticker, data: null };
    }
}

async function initApp() {
    if (appState.portfolios.length === 0) {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'none';
        return;
    }

    document.getElementById('main-content').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('loading-spinner').style.display = 'flex';

    try {
        const earliestDate = getEarliestDate();
        let tickersSet = new Set(Object.values(INDICES));

        appState.portfolios.forEach(p => {
            Object.keys(p.assets).forEach(t => tickersSet.add(t));
        });

        const allTickers = Array.from(tickersSet);

        // Fetch all data starting from the earliest date required
        const results = await Promise.all(
            allTickers.map(ticker => fetchTickerData(ticker, earliestDate))
        );

        const rawData = {};
        let allDatesSet = new Set();

        results.forEach(res => {
            if (res.data) {
                rawData[res.ticker] = res.data;
                Object.keys(res.data).forEach(d => {
                    if (d <= appState.endDate) { // filter out dates beyond end date in case proxy cached
                        allDatesSet.add(d);
                    }
                });
            } else {
                console.warn(`Missing data for ${res.ticker}`);
                rawData[res.ticker] = {};
            }
        });

        const allDates = Array.from(allDatesSet).sort();

        if (allDates.length === 0) {
            throw new Error("No data fetched. Check tickers, dates, or network.");
        }

        // Forward and backward fill missing data
        const cleanedData = {};
        allTickers.forEach(ticker => {
            cleanedData[ticker] = {};
            let lastVal = null;
            allDates.forEach(date => {
                if (rawData[ticker][date] !== undefined) {
                    lastVal = rawData[ticker][date];
                }
                if (lastVal !== null) {
                    cleanedData[ticker][date] = lastVal;
                }
            });

            let firstVal = null;
            for (let i = 0; i < allDates.length; i++) {
                if (cleanedData[ticker][allDates[i]] !== undefined) {
                    firstVal = cleanedData[ticker][allDates[i]];
                    break;
                }
            }
            if (firstVal !== null) {
                for (let i = 0; i < allDates.length; i++) {
                    if (cleanedData[ticker][allDates[i]] === undefined) {
                        cleanedData[ticker][allDates[i]] = firstVal;
                    } else {
                        break;
                    }
                }
            }
        });

        // Calculate performance
        function calcPerformance(portfolio) {
            const series = {};
            const validDates = allDates.filter(d => d >= portfolio.startDate);
            if (validDates.length === 0) return series;

            const baseDate = validDates[0]; // Day 1 for this portfolio

            validDates.forEach(date => {
                let dailySum = 0;
                for (const [ticker, weight] of Object.entries(portfolio.assets)) {
                    const price = cleanedData[ticker]?.[date];
                    const basePrice = cleanedData[ticker]?.[baseDate];

                    if (price && basePrice) {
                        dailySum += (price / basePrice) * weight;
                    }
                }
                series[date] = dailySum;
            });
            return series;
        }

        const plotData = {};

        // Compute Portfolios
        appState.portfolios.forEach(p => {
            plotData[p.name] = calcPerformance(p);
        });

        // Compute Indices starting from EARLIEST date
        const indicesPerf = {};
        for (const [name, ticker] of Object.entries(INDICES)) {
            const series = {};
            const validDates = allDates.filter(d => d >= earliestDate);
            const baseDate = validDates.find(d => cleanedData[ticker]?.[d] !== undefined);

            if (baseDate) {
                const basePrice = cleanedData[ticker][baseDate];
                validDates.forEach(date => {
                    if (cleanedData[ticker][date]) {
                        series[date] = cleanedData[ticker][date] / basePrice;
                    }
                });
            }
            // Add prefix or suffix to Indices so they don't get confused with portfolios
            plotData[name] = series;
        }

        // Convert base 1.0 to Percentage Change
        const pctChangeData = {};
        Object.keys(plotData).forEach(name => {
            pctChangeData[name] = {};
            Object.entries(plotData[name]).forEach(([date, val]) => {
                pctChangeData[name][date] = (val - 1) * 100;
            });
        });

        // Make container visible BEFORE rendering Plotly so it calculates 100% width correctly
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // Render UI Elements
        renderSummaryCards(pctChangeData);
        renderPlotlyChart(pctChangeData);
        renderMonthlyTable(plotData);

    } catch (err) {
        console.error(err);
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-text').innerText = err.message;
    }
}

function renderSummaryCards(pctChangeData) {
    const container = document.getElementById('summary-cards');
    let html = '';

    const colorsList = ["#FF9500", "#5856D6", "#34C759", "#AF52DE", "#FF2D55"];
    let colorIdx = 0;

    for (const name of Object.keys(pctChangeData)) {
        const dates = Object.keys(pctChangeData[name]).sort();
        if (dates.length === 0) continue;

        const currentReturn = pctChangeData[name][dates[dates.length - 1]];
        let dailyChangePct = 0.0;

        if (dates.length > 1) {
            const prevReturn = pctChangeData[name][dates[dates.length - 2]];
            const currentVal = 100 * (1 + currentReturn / 100);
            const prevVal = 100 * (1 + prevReturn / 100);
            dailyChangePct = ((currentVal - prevVal) / prevVal) * 100;

            if (Math.abs(dailyChangePct) < 0.0001 && dates.length > 2) {
                const prevPrevReturn = pctChangeData[name][dates[dates.length - 3]];
                const valPrevPrev = 100 * (1 + prevPrevReturn / 100);
                dailyChangePct = ((prevVal - valPrevPrev) / valPrevPrev) * 100;
            }
        }

        const totalColor = currentReturn >= 0 ? 'var(--positive-color)' : 'var(--negative-color)';
        const dailyColor = dailyChangePct >= 0 ? 'var(--positive-color)' : 'var(--negative-color)';
        const arrow = dailyChangePct >= 0 ? '▲' : '▼';
        const signTotal = currentReturn >= 0 ? '+' : '';

        // Map Colors dynamically
        let indicatorColor = "#aaaaaa";
        const isIndex = Object.keys(INDICES).includes(name);

        if (isIndex && appState.indexColors) {
            indicatorColor = appState.indexColors[name] || (name === "KOSPI" ? "#aaaaaa" : (name === "NASDAQ" ? "#34C759" : "#FF2D55"));
        } else {
            const port = appState.portfolios.find(p => p.name === name);
            if (port && port.color) {
                indicatorColor = port.color;
            } else {
                indicatorColor = colorsList[(colorIdx++) % colorsList.length];
            }
        }

        html += `
            <div class="metric-card" style="border-top: 4px solid ${indicatorColor};">
                <div class="metric-name">${name}</div>
                <div class="metric-value" style="color: ${totalColor};">
                    ${signTotal}${currentReturn.toFixed(2)}%
                </div>
                <div class="metric-delta" style="color: ${dailyColor};">
                    ${arrow} ${Math.abs(dailyChangePct).toFixed(2)}%
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderPlotlyChart(pctChangeData) {
    const traces = [];
    const colorsList = ["#FF9500", "#5856D6", "#34C759", "#AF52DE", "#FF2D55"];
    let colorIdx = 0;

    for (const [name, series] of Object.entries(pctChangeData)) {
        const dates = Object.keys(series).sort();

        const isIndex = Object.keys(INDICES).includes(name);
        const lineWidth = isIndex ? 2 : 4;
        const lineDash = isIndex ? "dash" : "solid";
        const opacity = isIndex ? 0.5 : 1.0;

        let lineColor = "#aaaaaa";
        if (isIndex && appState.indexColors) {
            lineColor = appState.indexColors[name] || (name === "KOSPI" ? "#aaaaaa" : (name === "NASDAQ" ? "#34C759" : "#FF2D55"));
        } else {
            const port = appState.portfolios.find(p => p.name === name);
            if (port && port.color) {
                lineColor = port.color;
            } else {
                lineColor = colorsList[(colorIdx++) % colorsList.length];
            }
        }

        traces.push({
            x: dates,
            y: dates.map(d => series[d]),
            mode: 'lines',
            name: name,
            line: { width: lineWidth, color: lineColor, dash: lineDash },
            opacity: opacity,
            hovertemplate: '%{y:.2f}%<extra></extra>'
        });
    }

    const layout = {
        xaxis: {
            title: "Date",
            range: [getEarliestDate(), appState.endDate],
            tickformat: "%Y-%m-%d",
            dtick: "M1",
            tickangle: -45
        },
        yaxis: { title: "Return (%)" },
        hovermode: "x unified",
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        font: { color: "#fafafa" },
        xaxis: { gridcolor: "#444" },
        yaxis: { gridcolor: "#444" },
        legend: { yanchor: "top", y: 0.99, xanchor: "left", x: 0.01 },
        margin: { l: 40, r: 20, t: 30, b: 60 },
        autosize: true,
        // Fix hover label background color so text is visible
        hoverlabel: {
            bgcolor: "#262730",
            font: { color: "#fafafa" }
        }
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.newPlot('plotly-chart', traces, layout, config);
}

function renderMonthlyTable(plotData) {
    const monthlyLastValues = {};

    for (const [name, series] of Object.entries(plotData)) {
        monthlyLastValues[name] = {};
        const dates = Object.keys(series).sort();

        const groupedByMonth = {};
        dates.forEach(d => {
            const yyyymm = d.slice(0, 7);
            groupedByMonth[yyyymm] = series[d];
        });

        monthlyLastValues[name] = groupedByMonth;
    }

    let allMonths = new Set();
    Object.values(monthlyLastValues).forEach(series => {
        Object.keys(series).forEach(m => allMonths.add(m));
    });

    const sortedMonths = Array.from(allMonths).sort().reverse();
    const columns = Object.keys(plotData);

    const thead = document.getElementById('monthly-table-head');
    thead.innerHTML = `<th>Date</th>` + columns.map(c => `<th>${c}</th>`).join('');

    const tbody = document.getElementById('monthly-table-body');
    let html = '';

    const ascMonths = Array.from(sortedMonths).reverse();
    const monthlyChanges = {};
    sortedMonths.forEach(m => monthlyChanges[m] = {});

    columns.forEach(name => {
        const series = monthlyLastValues[name];
        let prevVal = null;

        ascMonths.forEach(m => {
            if (series[m] !== undefined) {
                const currentVal = series[m];
                if (prevVal !== null) {
                    monthlyChanges[m][name] = ((currentVal - prevVal) / prevVal) * 100;
                }
                prevVal = currentVal;
            }
        });
    });

    sortedMonths.forEach(m => {
        let hasData = columns.some(col => monthlyChanges[m][col] !== undefined);
        if (!hasData) return;

        html += `<tr><td>${m}</td>`;

        columns.forEach(col => {
            const val = monthlyChanges[m][col];
            if (val !== undefined && !isNaN(val)) {
                const sign = val >= 0 ? '+' : '';
                const colorCls = val >= 0 ? 'color-positive' : 'color-negative';
                html += `<td class="${colorCls}">${sign}${val.toFixed(2)}%</td>`;
            } else {
                html += `<td>-</td>`;
            }
        });

        html += `</tr>`;
    });

    tbody.innerHTML = html;
}
