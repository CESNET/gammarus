import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuItemLink from '../../components/Menu/MenutemLink';
import SubMenu from './SubMenu';
import LooksIcon from '@mui/icons-material/Looks';
import { Memory } from '@mui/icons-material';

const channelsSubMenu = [
	{ to: '/channel-plan', label: 'Channel plan' },
	{ to: '/', label: 'Media-channels' },
];

export const mainListItems = (
	<>
		<MenuItemLink to="/" primary="Dashboard" icon={<DashboardIcon />} />
		<MenuItemLink to="/hardware" primary="Hardware" icon={<Memory />} />
		<SubMenu titleText="Channels" titleIcon={<LooksIcon />} menuItems={channelsSubMenu} />
	</>
);

export const secondaryListItems = (
	<React.Fragment>
		{/* <ListSubheader component="div" inset>
			Pokračování listu
		</ListSubheader>
		<ListItemButton>
			<ListItemIcon>
				<AssignmentIcon />
			</ListItemIcon>
			<ListItemText primary="" />
		</ListItemButton> */}
	</React.Fragment>
);
