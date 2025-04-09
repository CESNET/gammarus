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
    const response = await fetch(window.location.href + "../../../dummy/sdn-bidi-cplus1572/dummy-data-czechlight-bidi-amp.json");
    if (!response.ok) {
        throw Error(`Data request didn't get a proper response (status=${response.status})`);
    }
    const data = await response.json();
    return data;
}


/** @type {HTMLCanvasElement} */
// @ts-ignore - getElementById returns HTMLElement and I can't do type assertions (`as`) in JS.
let canvasPowerCBand = document.getElementById("canvasPowerCBand");
let canvasPower1572 = document.getElementById("canvasPower1572");
let canvasSpectrumCBand = document.getElementById("canvasSpectrumCBand");
let errorElement = document.getElementById("error");

const showError = (message) => {
    canvasPowerCBand.style.backgroundColor = "rgba(255,224,224,255)";
    canvasPower1572.style.backgroundColor = "rgba(255,224,224,255)";
    canvasSpectrumCBand.style.backgroundColor = "rgba(255,224,224,255)";
    errorElement.innerText = `Error: ${message}`;
}

const updateBarGraph = (chart, canvas, band, data) => {
    try {
        const eastToWest = data["czechlight-bidi-amp:" + band]["east-to-west"]
        const westToEast = data["czechlight-bidi-amp:" + band]["west-to-east"];

        chart.data.datasets[0].data[0][1] = westToEast["input-power"];
        chart.data.datasets[0].data[2][1] = eastToWest["input-power"];
        chart.data.datasets[1].data[0][1] = eastToWest["output-power"];
        chart.data.datasets[1].data[2][1] = westToEast["output-power"];

        chart.data.datasets[2].data[1][1] = data["czechlight-bidi-amp:" + band]["pump"];
        chart.data.datasets[3].data[1][1] = data["czechlight-bidi-amp:" + band]["real-pump-current"];

        chart.update();
        canvas.style.backgroundColor = "rgba(255,0,0,0)";
        errorElement.innerText = "";
    } catch (err) {
        canvas.style.backgroundColor = "rgba(255,224,224,255)";
        errorElement.innerText = `Error: ${err.message}`;
    }
}

let eventStream = null;
let retrying = null;

const startStreaming = (chartPowerCBand, chartPower1572) => {
    clearTimeout(retrying);
    eventStream = new EventSource("/telemetry/optics");
    eventStream.onerror = () => {
        showError("Network error");
        retrying = setTimeout(startStreaming, 2000, chartPowerCBand, chartPower1572);
    }
    eventStream.onmessage = (e) => {
        let data = JSON.parse(e.data)["ietf-restconf:notification"]["ietf-yang-push:push-update"]["datastore-contents"];
        updateBarGraph(chartPowerCBand, canvasPowerCBand, "c-band", data);
        updateBarGraph(chartPower1572, canvasPower1572, "narrow-1572", data);
    }
}

const main = async () => {
    const LOW = -100.0;

    const graphOptions = {
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
                {
                    id: 'pump-current',
                    position: 'right',
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: "Current",
                    },
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        maxRotation: 0,
                        min: 0,
                        max: 1000,
                        beginAtZero: true,
                        callback: function (value, index, values) {
                            switch (value) {
                                case 1:
                                case 2:
                                case 5:
                                case 10:
                                case 20:
                                case 50:
                                case 100:
                                case 200:
                                case 500:
                                    return value + " mA";
                                case 1000:
                                    return "1 A";
                            }
                            return null;
                        },
                    },
                }
            ],
        },
        skipNull: true, // FIXME: this doesn't work in Charts.js 2.9.x
    }

    const chartPowerCBand = new Chart(canvasPowerCBand, {
        type: "bar",
        data: {
            labels: [
                "West",
                "Pump",
                "East",
            ],
            datasets: [
                {
                    label: "Input @ C-band",
                    backgroundColor: "SteelBlue",
                    data: [[LOW, LOW], [], [LOW, LOW], ],
                },
                {
                    label: "Output @ C-band",
                    backgroundColor: "DarkOliveGreen",
                    data: [[LOW, LOW], [], [LOW, LOW], ],
                },
                {
                    label: "Configured Current",
                    backgroundColor: "LightCoral",
                    data: [[], [0, 0], []],
                    yAxisID: 'pump-current',
                },
                {
                    label: "Actual Current",
                    backgroundColor: "FireBrick",
                    data: [[], [0, 0], []],
                    yAxisID: 'pump-current',
                },
            ],
        },
        options: graphOptions
    });
    const chartPower1572 = new Chart(canvasPower1572, {
        type: "bar",
        data: {
            labels: [
                "West",
                "Pump",
                "East",
            ],
            datasets: [
                {
                    label: "Input @ 1572nm",
                    backgroundColor: "DodgerBlue",
                    data: [[LOW, LOW], [], [LOW, LOW], ],
                },
                {
                    label: "Output @ 1572nm",
                    backgroundColor: "OliveDrab",
                    data: [[LOW, LOW], [], [LOW, LOW], ],
                },
                {
                    label: "Configured Current",
                    backgroundColor: "LightCoral",
                    data: [[], [0, 0], [], ],
                    yAxisID: 'pump-current',
                },
                {
                    label: "Actual Current",
                    backgroundColor: "FireBrick",
                    data: [[], [0, 0], [], ],
                    yAxisID: 'pump-current',
                },
            ],
        },
        options: graphOptions
    });

    if (window.location.pathname.match("/ci-logs-public/")) {
        try {
            const data = await getDummyData();
            updateBarGraph(chartPowerCBand, canvasPowerCBand, "c-band", data);
            updateBarGraph(chartPower1572, canvasPower1572, "narrow-1572", data);
        } catch (err) {
            showError(err.message);
        }
    } else {
        startStreaming(chartPowerCBand, chartPower1572);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState == 'visible') {
                startStreaming(chartPowerCBand, chartPower1572);
            } else {
                eventStream.close();
                showError("paused");
            }
        });
    }
}


main();
