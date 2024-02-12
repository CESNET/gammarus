import { ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material'

import PropTypes from 'prop-types'

const InfoItem = ({ icon, label, value }) => {
	return (
		<ListItem disablePadding>
			<ListItemAvatar>
				<Avatar>{icon}</Avatar>
			</ListItemAvatar>
			<ListItemText primary={label} secondary={value} />
		</ListItem>
	)
}

InfoItem.propTypes = {
	icon: PropTypes.node.isRequired,
	label: PropTypes.string.isRequired,
	value: PropTypes.string,
}

export default InfoItem
