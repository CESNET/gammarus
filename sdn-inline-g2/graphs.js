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
 * @property {Data} czechlight-inline-amp:*
 */


/** @returns {Promise<Input>} */
const getDummyData = async () => {
    const response = await fetch(window.location.href + "../../../dummy/sdn-inline/dummy-data-czechlight-inline-amp.json");
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
let ctx = document.getElementById("myChart");
let errorElement = document.getElementById("error");

const showError = (message) => {
    ctx.style.backgroundColor = "rgba(255,224,224,255)";
    errorElement.innerText = `Error: ${message}`;
}

const updateGraph = (chart, data) => {
    try {
        const eastToWest = data["czechlight-inline-amp:east-to-west"];
        const westToEast = data["czechlight-inline-amp:west-to-east"];

        chart.data.datasets[0].data[0][1] = westToEast["optical-power"]["input"];
        chart.data.datasets[1].data[0][1] = eastToWest["optical-power"]["output"];
        chart.data.datasets[0].data[1][1] = eastToWest["optical-power"]["input"];
        chart.data.datasets[1].data[1][1] = westToEast["optical-power"]["output"]
        chart.data.datasets[2].data[0][0] = parseFloat(chart.data.datasets[1].data[0][1]);
        chart.data.datasets[2].data[0][1] = parseFloat(eastToWest['output-voa']) + chart.data.datasets[2].data[0][0];
        chart.data.datasets[2].data[1][0] = parseFloat(chart.data.datasets[1].data[1][1]);
        chart.data.datasets[2].data[1][1] = parseFloat(westToEast['output-voa']) + chart.data.datasets[2].data[1][0];

        chart.update();
        ctx.style.backgroundColor = "rgba(255,0,0,0)";
        errorElement.innerText = "";
    } catch (err) {
        ctx.style.backgroundColor = "rgba(255,224,224,255)";
        errorElement.innerText = `Error: ${err.message}`;
    }
}

let eventStream = null;
let retrying = null;

const startStreaming = (chart) => {
    clearTimeout(retrying);
    eventStream = new EventSource("/telemetry/optics");
    eventStream.onerror = () => {
        showError("Network error");
        retrying = setTimeout(startStreaming, 2000, chart);
    }
    eventStream.onmessage = (e) => {
        let data = JSON.parse(e.data)["ietf-restconf:notification"]["ietf-yang-push:push-update"]["datastore-contents"];
        updateGraph(chart, data);
    }
}

const main = async () => {
    const LOW = -100.0;

    const myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "West",
                "East",
            ],
            datasets: [
                {
                    label: "Line IN",
                    backgroundColor: "blue",
                    data: [[LOW, LOW], [LOW, LOW], ],
                    stack: "in",
                },
                {
                    label: "Line OUT",
                    backgroundColor: "red",
                    data: [[LOW, LOW], [LOW, LOW], ],
                    stack: "out",
                },
                {
                    label: "Output VOA Attenuation",
                    backgroundColor: "pink",
                    data: [[LOW, LOW], [LOW, LOW], ],
                    stack: "out",
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
                            min: -60.0,
                            suggestedMax: 0.0,
                            beginAtZero: false,
                        },
                        stacked: false,
                    },
                ],
            },
        }
    });

    if (window.location.pathname.match("/ci-logs-public/")) {
        try {
            const data = await getDummyData();
            updateGraph(myChart, data);
        } catch (err) {
            showError(err.message);
        }
    } else {
        startStreaming(myChart);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState == 'visible') {
                startStreaming(myChart);
            } else {
                eventStream.close();
                showError("paused");
            }
        });
    }
}


main();
