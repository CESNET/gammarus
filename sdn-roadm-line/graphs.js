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
 * @property {Data} czechlight-roadm-device:full-spectrum-scan
 */


/** @returns {Promise<Input>} */
const getData = async () => {
    let url;
    if (window.location.pathname.match("/ci-logs-CzechLight-internal/")) {
        url = window.location.href + "../../../dummy/sdn-roadm-line/dummy-rpc-full-spectrum-scan.json";
    } else {
        url = "/+restconf/operations/czechlight-roadm-device:full-spectrum-scan";
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
let ctx = document.getElementById("myChart");
let errorElement = document.getElementById("error");

/** @param {Chart} chart */
const refreshFunction = async (chart) => {
    if (document.hidden) {
        setTimeout(refreshFunction, 500, chart);
        return;
    }

    try {
        const data = await getData();

        /** @type {Data} */
        const innerData = data["czechlight-roadm-device:full-spectrum-scan"];

        let commonInData = transformData(innerData["common-in"]);
        let commonOutData = transformData(innerData["common-out"]);

        chart.options.plugins.zoom.zoom.rangeMin = {x: Math.floor(commonInData[0].x)};
        chart.options.plugins.zoom.zoom.rangeMax = {x: Math.ceil(commonInData[commonInData.length - 1].x)};

        chart.options.plugins.zoom.pan.rangeMin = {x: Math.floor(commonInData[0].x)};
        chart.options.plugins.zoom.pan.rangeMax = {x: Math.ceil(commonInData[commonInData.length - 1].x)};

        // If the user pans the chart before the first update comes in, the chart
        // no longer automatically sets min/max of X (probably because
        // the pan plugin sets it manually), so I have to set it manually too.
        if (chart.data.datasets[0].data.length == 0) {
            chart.options.scales.xAxes[0].ticks.min = chart.options.plugins.zoom.pan.rangeMin.x;
            chart.options.scales.xAxes[0].ticks.max = chart.options.plugins.zoom.pan.rangeMax.x;
        }

        chart.data.datasets[0].data = commonInData;
        chart.data.datasets[1].data = commonOutData;
        chart.update();
        ctx.style.backgroundColor = "rgba(255,0,0,0)";
        errorElement.innerText = "";
    } catch (err) {
        ctx.style.backgroundColor = "rgba(255,224,224,255)";
        errorElement.innerText = `Error: ${err.message}`;
    }
    setTimeout(refreshFunction, 500, chart)
}

const main = async () => {
    let oldXmin;
    let oldXmax;

    let myChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Line IN",
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 0.3,
                    pointRadius: 2.0,
                    pointHoverRadius: 1,
                    backgroundColor: "blue",
                    borderColor: "blue",
                    pointBorderColor: "blue",
                },
                {
                    label: "Line OUT",
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 0.3,
                    pointRadius: 2.0,
                    pointHoverRadius: 1,
                    backgroundColor: "red",
                    borderColor: "red",
                    pointBorderColor: "red",
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

    refreshFunction(myChart);
}


main();
