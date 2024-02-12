

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Copyright(props) {
	return (
		<Typography variant="body2" color="text.secondary" align="center" {...props}>
			{'Copyright © '}
			<Link color="inherit" href="https://www.cesnet.cz/">
				1996–{new Date().getFullYear()} CESNET, z. s. p. o.
			</Link>{' '}
		</Typography>
	);
}
