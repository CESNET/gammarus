import ComputerIcon from '@mui/icons-material/Computer';
import InfoIcon from '@mui/icons-material/Info';
import PublishIcon from '@mui/icons-material/Publish';
import Grid from '@mui/material/Grid';
import { useContext } from 'react';
import Page from '@/layout/Page/Page';
import InfoBox from '@/components/InfoBox/InfoBox';
import { YangDataContext } from '@/contexts/YangDataContext';

export default function Dashboard() {
	const { model } = useContext(YangDataContext);
	const InfoxBoxes = {
		systemInfo: [
			{ label: 'Hostname', value: model['ietf-system:system'] !== undefined ? model['ietf-system:system'].hostname : null, icon: <ComputerIcon /> },
			{
				label: 'OS Name',
				value: model['ietf-system:system-state'] !== undefined ? model['ietf-system:system-state'].platform['os-name'] : null,
				icon: <InfoIcon />,
			},
			{
				label: 'OS Release',
				value: model['ietf-system:system-state'] !== undefined ? model['ietf-system:system-state'].platform['os-release'] : null,
				icon: <PublishIcon />,
			},
			{
				label: 'OS Version',
				value: model['ietf-system:system-state'] !== undefined ? model['ietf-system:system-state'].platform['os-version'] : null,
				icon: <span style={{ fontSize: '24px', fontWeight: 'bold' }}>v </span>,
			},
		],
	};

	return (
		<Page title="Dashboard">
			<Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
				<Grid item xs={12} sm={12} md={4}>
					<InfoBox title="System information" InfoItems={InfoxBoxes.systemInfo} />
				</Grid>
			</Grid>
		</Page>
	);
}
