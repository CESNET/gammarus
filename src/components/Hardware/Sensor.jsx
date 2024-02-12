import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { capitalizeFirstLetter } from '@/utils/common';

import { SCALES, UNITS, STATUS } from '@/constants/hardware';

export default function Sensor(sensor) {
	const value = sensor['sensor-data']['value'] * (1 / 10 ** sensor['sensor-data']['value-precision']) * SCALES[sensor['sensor-data']['value-scale']];
	const roundedValue = Math.round((value + Number.EPSILON) * 1000) / 1000;

	const unit = UNITS[sensor['sensor-data']['value-type']] ?? UNITS[sensor['sensor-data']['units-display']] ?? sensor['sensor-data']['units-display'];
	const displayName = capitalizeFirstLetter(sensor.name.split(':').pop());

	return (
		<TableRow>
			<TableCell component="th" scope="row">
				{displayName}
			</TableCell>
			<TableCell>
				<Typography color={`${STATUS[sensor['sensor-data']['oper-status']]}.main`}>{`${roundedValue} ${unit}`}</Typography>
			</TableCell>
		</TableRow>
	);
}
