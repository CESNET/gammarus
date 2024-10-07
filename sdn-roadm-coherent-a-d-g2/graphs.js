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
const getDummyData = async () => {
    const response = await fetch(window.location.href + "../../../dummy/sdn-roadm-coherent-a-d/dummy-data-czechlight-coherent-add-drop.json");
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
        const aggData = data["czechlight-coherent-add-drop:aggregate-power"];
        const leafData = data["czechlight-coherent-add-drop:client-ports"];

        chart.data.datasets[0].data[0][1] = aggData["express-out"];
        chart.data.datasets[1].data[0][1] = aggData["express-in"];
        for (port = 1; port <= 8; port++) {
            chart.data.datasets[3].data[port][1] = aggData["drop"];
            const leaf = leafData.filter((value) => { return value["port"] == port; })[0];
            chart.data.datasets[2].data[port][1] = leaf["input-power"];
            chart.data.labels[port] = leaf["description"];
            if (chart.data.labels[port] === undefined) {
                chart.data.labels[port] = `Client ${port}`;
            }
        }

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
                "Express",
                "Client 1",
                "Client 2",
                "Client 3",
                "Client 4",
                "Client 5",
                "Client 6",
                "Client 7",
                "Client 8",
            ],
            datasets: [
                {
                    label: "Express OUT",
                    backgroundColor: "orange",
                    data: [[LOW, LOW], ],
                    stack: "ADD",
                },
                {
                    type: "bar",
                    label: "Express IN",
                    backgroundColor: "teal",
                    data: [[LOW, LOW], ],
                    stack: "DROP",
                },
                {
                    label: "Client IN",
                    backgroundColor: "pink",
                    data: [[LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], ],
                    stack: "ADD",
                },
                {
                    label: "Client OUT",
                    backgroundColor: "brown",
                    data: [[LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], [LOW, LOW], ],
                    stack: "DROP",
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
                        },
                        stacked: true,
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
