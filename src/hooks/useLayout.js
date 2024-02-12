import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * A custom hook for handling various layout-related tasks.
 *
 * @returns {{
 *   isMobile: boolean,
 *   isTablet: boolean,
 * }}
 */
export default function useLayout() {
	const theme = useTheme();

	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

	// Return an object with all the layout-related utilities
	return {
		isMobile,
		isTablet,
	};
}
