import { Link } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import PropTypes from 'prop-types'

export default function IconLink({ icon, to, ariaLabel }) {
	return (
		<IconButton component={Link} to={to} aria-label={ariaLabel} sx={{ width: 'auto' }}>
			{icon}
		</IconButton>
	)
}

IconLink.propTypes = {
	icon: PropTypes.node.isRequired,
	to: PropTypes.string.isRequired,
	ariaLabel: PropTypes.string.isRequired,
}
