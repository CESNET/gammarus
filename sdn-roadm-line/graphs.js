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

const getData = async () => {
    let url;
    if (window.location.href.match("logs")) {
        url = window.location.href + "../../../dummy/sdn-roadm-line/dummy-rpc-full-spectrum-scan.json";
    } else {
        url = "/+restconf/operations/czechlight-roadm-device:full-spectrum-scan";
    }
    const response = await fetch(url);
    const data = await response.json();
    return data;
}


/** @param {Value[]} data */
const transformData = (data) => data.map((value) => { return {x: value.frequency / 1000000, y: value.power}; }).sort((a, b) => a.x - b.x);

const main = async () => {
    let oldXmin;
    let oldXmax;

    let ctx = document.getElementById('myChart');

    /** @type Input */
    const data = await getData();

    /** @type {Data} */
    const innerData = data['czechlight-roadm-device:full-spectrum-scan'];

    let commonInData = transformData(innerData['common-in']);
    let commonOutData = transformData(innerData['common-out']);


    let myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: "Line IN",
                    data: commonInData,
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 1,
                    backgroundColor: "blue"
                },
                {
                    label: "Line OUT",
                    data: commonOutData,
                    showLine: true,
                    lineTension: 0,
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 1,
                    backgroundColor: "red"
                },

            ],
        },
        options: {
            animation: false,
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
                            maxRotation: 0
                        }
                    }
                ]
            },
            plugins: {
                zoom: {
                    pan: {
                        rangeMin: {
                            x: Math.floor(commonInData[0].x)
                        },
                        rangeMax: {
                            x: Math.ceil(commonInData[commonInData.length - 1].x)
                        },
                        enabled: true,
                        mode: 'x',

                        /**
                         * @param {{chart: Chart}} chart - An object, where the `chart` property is the actual Chart
                         */
                        onPan: ({chart}) => {
                            oldXmin = chart.options.scales.xAxes[0].ticks.min;
                            oldXmax = chart.options.scales.xAxes[0].ticks.max;
                        }
                    },
                    zoom: {
                        rangeMin: {
                            x: Math.floor(commonInData[0].x)
                        },
                        rangeMax: {
                            x: Math.ceil(commonInData[commonInData.length - 1].x)
                        },
                        enabled: true,
                        mode: 'x',

                        /**
                         * @param {{chart: Chart}} chart - An object, where the `chart` property is the actual Chart
                         */
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
                            chart.options.plugins.zoom.pan.rangeMin.x = commonInData[0].x - newRangeOffset;
                            chart.options.plugins.zoom.pan.rangeMax.x = commonInData[commonInData.length - 1].x + newRangeOffset;

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

    const refreshFunction = async () => {
        /** @type Input */
        const data = await getData();

        /** @type {Data} */
        const innerData = data['czechlight-roadm-device:full-spectrum-scan'];

        let commonInData = transformData(innerData['common-in']);
        let commonOutData = transformData(innerData['common-out']);

        myChart.data.datasets[0].data = commonInData;
        myChart.data.datasets[1].data = commonOutData;
        myChart.update();
    }
    setInterval(refreshFunction, 1000);
}


main();
