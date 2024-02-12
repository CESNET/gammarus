import List from '@mui/material/List'
import { CardContent, CardHeader } from '@mui/material'
import InfoItem from './components/InfoItem'
import Card from '@mui/material/Card'

import PropTypes from 'prop-types'

export default function InfoBox({ InfoItems, title, subtitle }) {
	return (
		<Card>
			<CardHeader title={title} subheader={subtitle} sx={{ paddingBottom: 0 }} />
			<CardContent sx={{ paddingTop: 0 }}>
				<List>
					{InfoItems?.map((item, index) => (
						<InfoItem key={index} label={item.label} value={item.value} icon={item.icon} />
					))}
				</List>
			</CardContent>
		</Card>
	)
}

InfoBox.propTypes = {
	InfoItems: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.string,
			icon: PropTypes.element.isRequired,
		}),
	),
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
}
