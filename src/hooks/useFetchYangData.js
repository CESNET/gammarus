import { useState, useEffect } from 'react';

const livePrefixes = [
	'czechlight-roadm-device:*',
	'czechlight-coherent-add-drop:*',
	'czechlight-inline-amp:*',
	'ietf-yang-library:*',
	'ietf-hardware:*',
	'ietf-interfaces:*',
	'ietf-system:*',
	'czechlight-lldp:*',
	'czechlight-system:firmware',
	'czechlight-system:leds',
];

async function fetchStatic(url) {
	const resp = await fetch(url);
	const js = await resp.json();
	return js;
}

async function fetchLive(url) {
	const resp = await Promise.all(
		livePrefixes.map(async (prefix) => {
			try {
				const resp = await fetch(`${url}/restconf/data/${prefix}`);
				if (!resp.ok) {
					throw resp.statusText;
				}
				return await resp.json();
			} catch (e) {
				console.error('Fetch error:', e);
				return {};
			}
		}),
	);

	return resp.reduce((prev, curr) => {
		return { ...prev, ...curr };
	}, {});
}

export function useFetchYangData(source, updateIntervalMs) {
	const [yangData, setYangData] = useState();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getModel = (source) => {
			setLoading(() => true);

			let fetchPromise;
			if (source.type === 'static') {
				fetchPromise = fetchStatic(`./data/${source.url}`);
			} else if (source.type === 'live') {
				fetchPromise = fetchLive(`http://${source.url}`);
			} else {
				console.error('Unknown model source.type');
			}

			fetchPromise.then((model) => {
				setYangData(() => model);
				setLoading(() => false);
			});
		};

		getModel(source);
		const interval = setInterval(() => getModel(source), updateIntervalMs);
		return () => clearInterval(interval);
	}, [source, updateIntervalMs]);

	return { loading, yangData };
}
