// I would love to define the full JSON structure, but typescript doesn't want
// colons in property names (although dashes work) and TS type checking is why
// I use JSDoc anyway.
/**
 * @typedef Value
 *
 * @property {number} frequency
 * @property {number} power
 */

/**
 * @typedef Data
 *
 * @property {Value[]} common-in
 * @property {Value[]} common-out
 */

/** @typedef Input
 * @property {Data} czechlight-coherent-add-drop:*
 */


/** @returns {Promise<Input>} */
const getData = async () => {
    let url;
    if (window.location.href.match("logs") || window.location.hostname == 'localhost') {
        url = window.location.href + "../../../dummy/sdn-roadm-coherent-a-d/dummy-data-czechlight-coherent-add-drop.json";
    } else {
        url = "/+restconf/data/czechlight-coherent-add-drop:*";
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw Error(`Data request didn't get a proper response (status=${response.status})`);
    }
    const data = await response.json();
    return data;
}


/** @param {Value[]} data */
const transformData = (data) => data.map((value) => { return {x: value.frequency / 1000000, y: value.power}; }).sort((a, b) => a.x - b.x);

/** @type {HTMLCanvasElement} */
// @ts-ignore - getElementById returns HTMLElement and I can't do type assertions (`as`) in JS.
let ctx = document.getElementById('myChart');
let errorElement = document.getElementById('error');

/** @param {Chart} chart */
const refreshFunction = async (chart) => {
    if (document.hidden) {
        setTimeout(refreshFunction, 500, chart);
        return;
    }

    /*
    if (false) {
        chart.data.datasets[0].data[0][1] = -9.8; // express out
        chart.data.datasets[1].data[0][1] = -12.0; // express in
        for (port = 1; port <= 8; port++) {
            chart.data.datasets[2].data[port][1] = -10 + port; // client in
            chart.data.datasets[3].data[port][1] = -5.6; // client out
        }
        chart.update();
        ctx.style.backgroundColor = 'rgba(255,0,0,0)';
        errorElement.innerText = "";
        setTimeout(refreshFunction, 500, chart)
        return;
    }*/

    try {
        const data = await getData();

        const aggData = data['czechlight-coherent-add-drop:aggregate-power'];
        const leafData = data['czechlight-coherent-add-drop:client-ports'];

        chart.data.datasets[0].data[0][1] = aggData['express-out'];
        chart.data.datasets[1].data[0][1] = aggData['express-in'];
        for (port = 1; port <= 8; port++) {
            chart.data.datasets[3].data[port][1] = aggData['drop'];
            const leaf = leafData.filter((value) => { return value['port'] == port; })[0];
            chart.data.datasets[2].data[port][1] = leaf['input-power'];
            try {
                chart.data.labels[port] = leaf['description'];
            } catch (err) {
                chart.data.labels[port] = 'Client ' + port;
            }
        }

        chart.update();
        ctx.style.backgroundColor = 'rgba(255,0,0,0)';
        errorElement.innerText = "";
    } catch (err) {
        ctx.style.backgroundColor = 'rgba(255,224,224,255)';
        errorElement.innerText = "Error: " + err.message;
    }
    setTimeout(refreshFunction, 500, chart)
}

const main = async () => {
    let oldXmin;
    let oldXmax;
    let LOW = -100.0;

    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Express',
                'Client 1',
                'Client 2',
                'Client 3',
                'Client 4',
                'Client 5',
                'Client 6',
                'Client 7',
                'Client 8',
            ],
            datasets: [
                {
                    label: "Express OUT",
                    backgroundColor: "orange",
                    data: [[LOW, LOW], ],
                },
                {
                    type: 'bar',
                    label: "Express IN",
                    backgroundColor: "teal",
                    data: [[LOW, LOW], ],
                },
                {
                    label: "Client IN",
                    backgroundColor: "pink",
                    data: [[LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], ],
                },
                {
                    label: "Client OUT",
                    backgroundColor: "brown",
                    data: [[LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], ],
                },

            ],
        },
        options: {
            scaleBeginAtZero: false,
            responsive: true,
            spanGaps: true,
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        gridlines: {
                            display: false,
                        },
                    },
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: "Power [dBm]"
                        },
                        ticks: {
                            maxRotation: 0,
                            min: -40.0,
                            suggestedMax: 0.0,
                            beginAtZero: false,
                        }
                    },
                ],
            },
        }
    });

    refreshFunction(myChart);
}


main();
