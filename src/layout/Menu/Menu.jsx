import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import logo from '@/assets/img/logo.svg';
import { mainListItems, secondaryListItems } from '@/layout/Menu/Menutems';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconLink from '@/components/Menu/IconLink';
import HelpIcon from '@mui/icons-material/Help';
import layout from '@/layout/Layout';

export default function Menu({ open, toggleMenu }) {
	return (
		<StyledDrawer variant="permanent" open={open}>
			<Toolbar
				sx={{
					display: 'flex',
					alignItems: 'center',
					width: '100%',
					justifyContent: 'center',
				}}
			>
				<img src={logo} alt="Czech light" style={{ margin: '5px', flexGrow: '1' }} />
				<IconButton onClick={toggleMenu}>{open && <ChevronLeftIcon />}</IconButton>
			</Toolbar>
			<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
				<List component="nav">
					{mainListItems}
					<Divider sx={{ my: 1 }} />
					{secondaryListItems}
				</List>
				<Box sx={{ alignSelf: 'start' }}>
					<IconLink icon={<HelpIcon />} to="/about" ariaLabel="help" />
				</Box>
			</Box>
		</StyledDrawer>
	);
}

Menu.propTypes = {
	open: PropTypes.bool.isRequired,
	toggleMenu: PropTypes.func.isRequired,
};

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
	'& .MuiDrawer-paper': {
		position: 'relative',
		whiteSpace: 'nowrap',
		width: layout.menuWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
		boxSizing: 'border-box',
		...(!open && {
			overflowX: 'hidden',
			transition: theme.transitions.create('width', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen,
			}),
			width: theme.spacing(0),
			[theme.breakpoints.up('sm')]: {
				width: theme.spacing(0),
			},
		}),
	},
}));
