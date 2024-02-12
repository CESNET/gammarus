import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const Theme = createTheme({
	palette: {
		primary: {
			main: grey[100],
		},
		secondary: {
			main: '#0068A2',
		},
	},
});
export default Theme;
