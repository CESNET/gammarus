import { useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Collapse, List } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuItemLink from '../../components/Menu/MenutemLink';
import PropTypes from 'prop-types';

export default function SubMenu({ titleText, titleIcon, menuItems }) {
	const [open, setOpen] = useState(false);

	const handleClick = () => {
		setOpen(!open);
	};

	return (
		<>
			<ListItemButton onClick={handleClick}>
				<ListItemIcon>{titleIcon}</ListItemIcon>
				<ListItemText primary={titleText} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding sx={{ pl: 4 }}>
					{menuItems.map((menuItem) => (
						<MenuItemLink key={menuItem.to} to={menuItem.to} primary={menuItem.label} icon={menuItem.icon} />
					))}
				</List>
			</Collapse>
		</>
	);
}

SubMenu.propTypes = {
	titleText: PropTypes.string.isRequired,
	titleIcon: PropTypes.element.isRequired,
	menuItems: PropTypes.arrayOf(
		PropTypes.shape({
			to: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			icon: PropTypes.element.isRequired,
		}),
	),
};
