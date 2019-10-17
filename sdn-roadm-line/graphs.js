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
    console.log(window.location.href);
    if (window.location.href.match("logs")) {
        url = window.location.href + "../../../dummy/sdn-roadm-line/dummy-rpc-full-spectrum-scan.json";
    } else {
        url = "/+restconf/operations/czechlight-roadm-device:full-spectrum-scan";
    }
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

const main = async () => {
    let ctx = document.getElementById('myChart');

    /** @type Input */
    const data = await getData();

    /** @type {Data} */
    const innerData = data['czechlight-roadm-device:full-spectrum-scan'];

    let commonInData = innerData['common-in'].map((value) => { return {x: value.frequency / 1000000, y: value.power}; }).sort((a, b) => a.x - b.x);
    let commonOutData = innerData['common-out'].map((value) => { return {x: value.frequency / 1000000, y: value.power}; }).sort((a, b) => a.x - b.x);


    new Chart(ctx, {
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
                            x: Math.floor(commonInData[0].x - 1)
                        },
                        rangeMax: {
                            x: Math.ceil(commonInData[commonInData.length - 1].x + 1)
                        },
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            },
        },
    });
}


main();
