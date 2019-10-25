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
 * @typedef ScanData
 *
 * @property {Value[]} common-in
 * @property {Value[]} common-out
 */

/** @typedef ScanInput
 * @property {ScanData} czechlight-roadm-device:full-spectrum-scan
 */

/**
 * @typedef Power
 *
 * @property {string} common-in
 * @property {string} common-out
 * @property {string} leaf-in
 * @property {string} leaf-out
 */

/**
 * @typedef MediaChannel
 *
 * @property {string} channel
 * @property {Power} power
 */

/**
 * @typedef Channel
 *
 * @property {string} name
 * @property {string} lower-frequency
 * @property {string} upper-frequency
 */

/**
 * @typedef ChannelPlan
 *
 * @property {Channel[]} channel
 */

/**
 * @typedef ChannelInput
 * @property {MediaChannel[]} czechlight-roadm-device:media-channels
 * @property {ChannelPlan[]} czechlight-roadm-device:channel-plan
 */


/** @param {Value[]} data */
const transformData = (data) => data.map((value) => { return {x: value.frequency / 1000000, y: value.power}; }).sort((a, b) => a.x - b.x);

/** @type {HTMLCanvasElement} */
// @ts-ignore - getElementById returns HTMLElement and I can't do type assertions (`as`) in JS.
let ctx = document.getElementById('myChart');
let errorElement = document.getElementById('error');

/** @returns {Promise<ScanInput>} */
const getScanData = async () => {
    let url;
    if (window.location.href.match("logs")) {
        url = window.location.href + "../../../dummy/sdn-roadm-line/dummy-rpc-full-spectrum-scan.json";
    } else {
        url = "/+restconf/operations/czechlight-roadm-device:full-spectrum-scan";
    }
    const response = await fetch(url, {cache: "no-store"});
    if (!response.ok) {
        throw Error(`Data request didn't get a proper response (status=${response.status})`);
    }
    const data = await response.json();
    return data;
}

/** @param {Chart} chart */
const plotScan = async (chart) => {
        const data = await getScanData();

        /** @type {ScanData} */
        const innerData = data['czechlight-roadm-device:full-spectrum-scan'];

        let commonInData = transformData(innerData['common-in']);
        let commonOutData = transformData(innerData['common-out']);

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
        ctx.style.backgroundColor = 'rgba(255,0,0,0)';
        errorElement.innerText = "";
}

/** @returns {Promise<ChannelInput>} */
const getChannelsData = async () => {
    let url;
    if (window.location.href.match("logs")) {
        url = window.location.href + "../../../dummy/sdn-roadm-line/dummy-data-czechlight-roadm-device.json";
    } else {
        url = "/+restconf/operations/czechlight-roadm-device:full-spectrum-scan";
    }
    const response = await fetch(url, {cache: "no-store"});
    if (!response.ok) {
        throw Error(`Data request didn't get a proper response (status=${response.status})`);
    }
    const data = await response.json();
    return data;
}

/** @param {Chart} chart */
const plotChannels = async (chart) => {
    const data = await getChannelsData();
    console.log(data);

    /** @type ChannelPlan */
    let channelPlan = data['czechlight-roadm-device:channel-plan'];

    /** @type MediaChannel[] */
    let mediaChannels = data['czechlight-roadm-device:media-channels'];
    let template = {
        drawTime: "beforeDatasetsDraw",
        type: "box",
        xScaleID: "xscale",
        yScaleID: "yscale",
        yMin: -50,
        borderWidth: 1
    }

    // @ts-ignore - for some reason, this is not in the `plugin` property, so TS doesn't know about it
    chart.options.annotation.annotations = [];
    // @ts-ignore - for some reason, this is not in the `plugin` property, so TS doesn't know about it
    let channelOut = mediaChannels.filter((mediaChannel) => mediaChannel.power['leaf-out'] !== undefined).map((mediaChannel) => {
        let {'upper-frequency': upper, 'lower-frequency': lower} = channelPlan.channel.find((channel) => channel.name == mediaChannel.channel);
        return {
            xMin: +lower/1000000,
            xMax: +upper/1000000,
            yMax: mediaChannel.power['leaf-out'],
            borderColor: "red",
            backgroundColor: "rgba(255,224,224,0.5)",

            ...template
        };
    });

    // @ts-ignore - for some reason, this is not in the `plugin`
    // property, so TS doesn't know about it
    let channelIn = mediaChannels.filter((mediaChannel) => mediaChannel.power['leaf-in'] !== undefined).map((mediaChannel) => {
        let {'upper-frequency': upper, 'lower-frequency': lower} = channelPlan.channel.find((channel) => channel.name == mediaChannel.channel);
        return {
            xMin: +lower/1000000,
            xMax: +upper/1000000,
            yMax: mediaChannel.power['leaf-in'],
            borderColor: "blue",
            backgroundColor: "rgba(224,224,255,0.5)",

            ...template
        };
    });

    // @ts-ignore - for some reason, this is not in the `plugin`
    // property, so TS doesn't know about it
    chart.options.annotation.annotations = [...channelIn, ...channelOut];
    chart.update();

    ctx.style.backgroundColor = 'rgba(255,0,0,0)';
    errorElement.innerText = "";
}

/** @param {Chart} chart */
const refreshFunction = async (chart) => {
    if (document.hidden) {
        setTimeout(refreshFunction, 500, chart);
        return;
    }

    try {
        plotScan(chart);
        plotChannels(chart);
    } catch (err) {
        ctx.style.backgroundColor = 'rgba(255,224,224,255)';
        errorElement.innerText = "Error: " + err.message;
    }
    setTimeout(refreshFunction, 500, chart)
}

const main = async () => {
    let oldXmin;
    let oldXmax;

    let myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: "Line IN",
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
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        id: "xscale",
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
                        id: "yscale",
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
            // @ts-ignore - for some reason, this is not in the `plugin`
            // property, so TS doesn't know about it
            annotation: {
                events: ["click"],
                annotations: [
                ]
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
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
                        mode: 'x',

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
