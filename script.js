let stockCount = 1;

function addNewStockRow() {
    stockCount++;
    const newStockRow = document.createElement('div');
    newStockRow.className = 'form-row';
    newStockRow.innerHTML = `
        <label for="stock${stockCount}">Stock</label>
        <input type="text" id="stock${stockCount}" name="stock${stockCount}" placeholder="Enter ticker">
        <label for="shares${stockCount}">Shares</label>
        <input type="number" id="shares${stockCount}" name="shares${stockCount}" placeholder="Enter # of shares">
    `;
    document.getElementById('additional-stocks').appendChild(newStockRow);
}

async function fetchStockPrice(ticker) {
    const API_KEY = '0S4wTnYC9S9EUQiPQhcutGEvcGNqq1LL';
    const url = `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].price;
        } else {
            console.error('Error fetching stock price');
            return null;
            // if error fetching stock price throw up an error bubble or something blank is not a valid tticker
        }
    } catch (error) {
        console.error('Error fetching stock price', error);
        return null;
    }
}

const width = 400;
const height = 400;
const radius = Math.min(width, height) / 2;

const svg = d3.select('#pie-chart')
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', `translate(${width / 2}, ${height / 2})`);

const color = d3.scaleOrdinal(d3.schemeCategory10);

// Shape helper to build arcs
const arcGenerator = d3.arc()
.innerRadius(0)
.outerRadius(radius);

// Pie function to convert data into pie slices
const pie = d3.pie()
.value(d => d.value);

// Function to update the pie chart with data
function updatePieChart(data) {
const arcs = pie(data);

// Build the pie chart: each part of the pie is a path that we build using the arc function
const path = svg.selectAll("path")
    .data(arcs);

path.enter()
    .append("path")
    .merge(path)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "white")
    .style("stroke-width", "0px")
    .style("opacity", 0.7)
    .each(function(d) { this._current = d; }) // store the initial angles
    .transition()
    .duration(750)
    .attrTween("d", function(d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return t => arcGenerator(interpolate(t));
    });

path.exit().remove();

// Add the annotation: use the centroid method to get the best coordinates
const text = svg.selectAll("text")
    .data(arcs);

text.enter()
    .append("text")
    .merge(text)
    .transition()
    .duration(750)
    .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "17px")
    .text(d => d.data.label);

text.exit().remove();
}

updatePieChart([
    { label: 'AAPL', value: 100 },
    { label: 'GOOGL', value: 200 },
    { label: 'AMZN', value: 300 },
]);


document.getElementById('visualize').addEventListener('click', async () => {
    // if visualize is empty throw an error thru a toast or something "Add at least one stock to visualize"
    const stocks = [];
    for (let i = 1; i <= stockCount; i++) {
        const stock = document.getElementById(`stock${i}`).value;
        const shares = document.getElementById(`shares${i}`).value;
        if (stock && shares) {
            stocks.push({ stock, shares });
        }
    }
    console.log(stocks);

    const positionValues = {};
    const pricePromises = stocks.map(({ stock, shares }) => {
    return fetchStockPrice(stock).then(price => {
        if (price) {
            positionValues[stock] = price * shares;
        }
    });
});

await Promise.all(pricePromises);

console.log(positionValues);

const data = Object.entries(positionValues).map(([label, value]) => ({ label, value }));
console.log(data);

updatePieChart(data);
});

let riskTolerance = '';

document.getElementById('low-risk').addEventListener('click', function() {
    riskTolerance = 'Low';
    updateRiskTolerance(riskTolerance);
});

document.getElementById('medium-risk').addEventListener('click', function() {
    riskTolerance = 'Medium';
    updateRiskTolerance(riskTolerance);
});

document.getElementById('high-risk').addEventListener('click', function() {
    riskTolerance = 'High';
    updateRiskTolerance(riskTolerance);
});

function updateRiskTolerance(risk) {
    console.log('Risk Tolerance set to:', risk);
}