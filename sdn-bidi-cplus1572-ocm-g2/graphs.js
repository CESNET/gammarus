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
let spectrumErrorElement = document.getElementById("spectrum-error");

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
        chart.data.datasets[0].data[1][1] = eastToWest["input-power"];
        chart.data.datasets[1].data[0][1] = eastToWest["output-power"];
        chart.data.datasets[1].data[1][1] = westToEast["output-power"];

        chart.update();
        canvas.style.backgroundColor = "rgba(255,0,0,0)";
        errorElement.innerText = "";
    } catch (err) {
        canvas.style.backgroundColor = "rgba(255,224,224,255)";
        errorElement.innerText = `Error: ${err.message}`;
    }
}

const transformData = (data) => data.p.map((power, index) => { return {x: data["lowest-frequency"] / 1000 + index * data.step / 1000, y: power}; });

const updateSpectrum = (chart, canvas, data) => {
    let westToEast = null;
    let eastToWest = null;
    try {
        /** @type {Data} */
        let innerData = data["czechlight-bidi-amp:c-band"];
        westToEast = transformData(innerData["west-to-east"]["output-spectrum"]);
        eastToWest = transformData(innerData["east-to-west"]["output-spectrum"]);
    } catch {
        spectrumErrorElement.innerText = "Spectrum scanning not configured";
        return;
    }

    chart.options.plugins.zoom.zoom.rangeMin = {x: Math.floor(westToEast[0].x)};
    chart.options.plugins.zoom.zoom.rangeMax = {x: Math.ceil(westToEast[westToEast.length - 1].x)};

    chart.options.plugins.zoom.pan.rangeMin = {x: Math.floor(westToEast[0].x)};
    chart.options.plugins.zoom.pan.rangeMax = {x: Math.ceil(westToEast[westToEast.length - 1].x)};

    // If the user pans the chart before the first update comes in, the chart
    // no longer automatically sets min/max of X (probably because
    // the pan plugin sets it manually), so I have to set it manually too.
    if (chart.data.datasets[0].data.length == 0) {
        chart.options.scales.xAxes[0].ticks.min = chart.options.plugins.zoom.pan.rangeMin.x;
        chart.options.scales.xAxes[0].ticks.max = chart.options.plugins.zoom.pan.rangeMax.x;
    }

    chart.data.datasets[0].data = eastToWest;
    chart.data.datasets[1].data = westToEast;
    chart.update();
    canvas.style.backgroundColor = "rgba(255,0,0,0)";
    spectrumErrorElement.innerText = "";
}

let eventStream = null;
let retrying = null;

const startStreaming = (chartPowerCBand, chartPower1572, chartSpectrumCBand) => {
    clearTimeout(retrying);
    eventStream = new EventSource("/telemetry/optics");
    eventStream.onerror = () => {
        showError("Network error");
        retrying = setTimeout(startStreaming, 2000, chartPowerCBand, chartPower1572, chartSpectrumCBand);
    }
    eventStream.onmessage = (e) => {
        let data = JSON.parse(e.data)["ietf-restconf:notification"]["ietf-yang-push:push-update"]["datastore-contents"];
        updateBarGraph(chartPowerCBand, canvasPowerCBand, "c-band", data);
        updateBarGraph(chartPower1572, canvasPower1572, "narrow-1572", data);
        updateSpectrum(chartSpectrumCBand, canvasSpectrumCBand, data);
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
            ],
        },
    }

    const chartPowerCBand = new Chart(canvasPowerCBand, {
        type: "bar",
        data: {
            labels: [
                "West",
                "East",
            ],
            datasets: [
                {
                    label: "Input @ C-band",
                    backgroundColor: "SteelBlue",
                    data: [[LOW, LOW], [LOW, LOW], ],
                },
                {
                    label: "Output @ C-band",
                    backgroundColor: "DarkOliveGreen",
                    data: [[LOW, LOW], [LOW, LOW], ],
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
                "East",
            ],
            datasets: [
                {
                    label: "Input @ 1572nm",
                    backgroundColor: "DodgerBlue",
                    data: [[LOW, LOW], [LOW, LOW], ],
                },
                {
                    label: "Output @ 1572nm",
                    backgroundColor: "OliveDrab",
                    data: [[LOW, LOW], [LOW, LOW], ],
                },

            ],
        },
        options: graphOptions
    });

    let oldXmin;
    let oldXmax;

    const chartSpectrumCBand = new Chart(canvasSpectrumCBand, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "West Output",
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 0.3,
                    pointRadius: 2.0,
                    pointHoverRadius: 1,
                    backgroundColor: "Tomato",
                    borderColor: "Tomato",
                    pointBorderColor: "Tomato",
                },
                {
                    label: "East Output",
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 0.3,
                    pointRadius: 2.0,
                    pointHoverRadius: 1,
                    backgroundColor: "DarkSlateBlue",
                    borderColor: "DarkSlateBlue",
                    pointBorderColor: "DarkSlateBlue",
                },

            ],
        },
        options: {
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: "Frequency [THz]"
                        },
                        ticks: {
                            maxRotation: 0
                        }
                    }
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: "Power [dBm]"
                        },
                        ticks: {
                            maxRotation: 0,
                            suggestedMin: -45.0,
                            suggestedMax: 0.0,
                        }
                    }
                ]
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: "x",
                        rangeMin: {
                        },
                        rangeMax: {
                        },

                        /** @param {{chart: Chart}} chart - An object, where the `chart` property is the actual Chart */
                        onPan: ({chart}) => {
                            oldXmin = chart.options.scales.xAxes[0].ticks.min;
                            oldXmax = chart.options.scales.xAxes[0].ticks.max;
                        }
                    },
                    zoom: {
                        enabled: true,
                        mode: "x",

                        /** @param {{chart: Chart}} chart - An object, where the `chart` property is the actual Chart */
                        onZoom: ({chart}) => {
                            let xmin = chart.options.scales.xAxes[0].ticks.min;
                            let xmax = chart.options.scales.xAxes[0].ticks.max;

                            // This limits maximum zoom.
                            // If the range after zoom is too small, undo the zoom and return.
                            if (xmax - xmin < 0.025){
                                chart.options.scales.xAxes[0].ticks.min = oldXmin;
                                chart.options.scales.xAxes[0].ticks.max = oldXmax;
                                chart.update();
                                return;
                            }

                            let newRangeOffset = (chart.options.scales.xAxes[0].ticks.max - chart.options.scales.xAxes[0].ticks.min) / 10;

                            // @ts-ignore - can't do type assertions (`as`) in JS.
                            chart.options.plugins.zoom.pan.rangeMin.x = chart.config.data.datasets[0].data[0].x - newRangeOffset;
                            // @ts-ignore - can't do type assertions (`as`) in JS.
                            chart.options.plugins.zoom.pan.rangeMax.x = chart.config.data.datasets[0].data[chart.config.data.datasets[0].data.length - 1].x + newRangeOffset;

                            // The pan plugin doesn't react to changes of
                            // rangeMin and rangeMax immediately, so I have to
                            // manually update the chart if the current min/max
                            // values are out of bounds.
                            if (xmin < chart.options.plugins.zoom.pan.rangeMin.x) {
                                chart.options.scales.xAxes[0].ticks.min = chart.options.plugins.zoom.pan.rangeMin.x;
                                chart.update();
                            }
                            if (xmax > chart.options.plugins.zoom.pan.rangeMax.x) {
                                chart.options.scales.xAxes[0].ticks.max = chart.options.plugins.zoom.pan.rangeMax.x;
                                chart.update();
                            }
                            oldXmin = chart.options.scales.xAxes[0].ticks.min;
                            oldXmax = chart.options.scales.xAxes[0].ticks.max;
                        }
                    }
                }
            }
        }
    });

    if (window.location.pathname.match("/ci-logs-public/")) {
        try {
            const data = await getDummyData();
            updateBarGraph(chartPowerCBand, canvasPowerCBand, "c-band", data);
            updateBarGraph(chartPower1572, canvasPower1572, "narrow-1572", data);
            updateSpectrum(chartSpectrumCBand, canvasSpectrumCBand, data);
        } catch (err) {
            showError(err.message);
        }
    } else {
        startStreaming(chartPowerCBand, chartPower1572, chartSpectrumCBand);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState == 'visible') {
                startStreaming(chartPowerCBand, chartPower1572, chartSpectrumCBand);
            } else {
                eventStream.close();
                showError("paused");
            }
        });
    }
}


main();
