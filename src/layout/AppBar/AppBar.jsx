import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MuiAppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PropTypes from 'prop-types';
import layout from '@/layout/Layout';
import { Box, Button, Tooltip } from '@mui/material';
import Divider from '@mui/material/Divider';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function AppBar({ open, toggleMenu }) {
	return (
		<StyledAppBar position="absolute" open={open} elevation={0} color="transparent">
			<Toolbar
				sx={{
					paddingRight: '24px', // keep right padding when drawer closed
				}}
			>
				<IconButton
					edge="start"
					color="inherit"
					aria-label="open drawer"
					onClick={toggleMenu}
					sx={{
						marginRight: '36px',
						...(open && { display: 'none' }),
					}}
				>
					<MenuIcon />
				</IconButton>
				<Box sx={{ flexGrow: 1, visibility: 'hidden', pointerEvents: 'none' }} />
				<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<Tooltip title="Last update" arrow>
						<Button variant="text" startIcon={<AutorenewIcon />} color="inherit">
							09/12/2023 13:00:46
						</Button>
					</Tooltip>
					<Divider orientation="vertical" variant="middle" flexItem />
					<IconButton color="inherit">
						<Badge badgeContent={4} color="secondary">
							<NotificationsIcon />
						</Badge>
					</IconButton>
				</Box>
			</Toolbar>
		</StyledAppBar>
	);
}

AppBar.propTypes = {
	open: PropTypes.bool.isRequired,
	toggleMenu: PropTypes.func.isRequired,
};

const StyledAppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		marginLeft: layout.menuWidth,
		width: `calc(100% - ${layout.menuWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));
