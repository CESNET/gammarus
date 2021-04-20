const getDummyData = async () => {
    const response = await fetch(window.location.href + "../../../dummy/sdn-roadm-line/dummy-data-ietf-system.json");
    if (!response.ok) {
        throw Error(`Data request didn't get a proper response (status=${response.status})`);
    }
    const data = await response.json();
    return data;
};

const setText = (text, elemId) => {
    document.getElementById(elemId).innerText = text;
};

const ietfSystemData =
    window.location.pathname.match("/ci-logs-CzechLight-internal/") || true ?
    getDummyData() :
    fetch("/restconf/data/ietf-system:system");

ietfSystemData.then((data) => {
    console.log(data);
    setText("Hostname: " + data["ietf-system:system"].hostname, "hostname");
}).catch((err) => {
    setText(err, "hostname");
});
