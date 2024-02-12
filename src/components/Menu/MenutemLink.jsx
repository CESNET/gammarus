import * as React from 'react'
import PropTypes from 'prop-types'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Link as RouterLink } from 'react-router-dom'

const Link = React.forwardRef(function Link(itemProps, ref) {
	return <RouterLink ref={ref} {...itemProps} role={undefined} />
})

export default function MenuItemLink(props) {
	const { icon, primary, to } = props

	return (
		<li>
			<ListItemButton component={Link} to={to}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItemButton>
		</li>
	)
}

MenuItemLink.propTypes = {
	icon: PropTypes.element,
	primary: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired,
}
