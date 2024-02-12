import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { styled } from '@mui/material/styles';

export default function Led({ led }) {
	const rgb = 2.55 * led.red + ',' + 2.55 * led.green + ',' + 2.55 * led.blue;
	return (
		<StyledButton
			size="small"
			sx={{ flexBasis: { xs: '25%', md: 'auto' }, flexShrink: { xs: '0', md: 'auto' } }}
			startIcon={<StyledCircleIcon rgb={rgb} />}
		>
			{led.name}
		</StyledButton>
	);
}

const StyledCircleIcon = styled(CircleIcon)(({ theme, rgb }) => ({
	stroke: theme.palette.text.primary,
	fill: `rgb(${rgb})`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
	color: theme.palette.text.primary,
}));

Led.propTypes = {
	led: PropTypes.arrayOf({
		name: PropTypes.string,
		red: PropTypes.number,
		green: PropTypes.number,
		blue: PropTypes.number,
	}),
};
