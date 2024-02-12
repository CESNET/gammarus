import Led from './Led';
import Box from '@mui/material/Box';
import { YangDataContext } from '@/contexts/YangDataContext';
import { useContext } from 'react';

export default function Leds() {
	const { model } = useContext(YangDataContext);
	const leds = model['czechlight-system:leds'];
	if (!leds) return null;

	const mappedLeds = prepareLedsPropertiesToSingleObject(leds.led);
	console.log('mappedData', mappedLeds);
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: { xs: 'space-between', sm: 'space-between', md: 'flex-end' },
				overflowX: { xs: 'auto', sm: 'auto', md: 'hidden' },
			}}
		>
			{mappedLeds.map((led) => (
				<Led key={led.name} led={led} />
			))}
		</Box>
	);
}

function prepareLedsPropertiesToSingleObject(leds) {
	const mapped = leds.reduce((result, current) => {
		const [name, color] = current.name.split(':');

		if (!result[name]) {
			result[name] = { name };
		}

		result[name][color] = current.brightness;

		return result;
	}, {});
	return Object.values(mapped);
}
