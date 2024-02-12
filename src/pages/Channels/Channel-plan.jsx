import Page from '../../layout/Page/Page';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useContext } from 'react';
import { YangDataContext } from '@/contexts/YangDataContext';
import { C } from '@/constants/common';
import { TableContainer } from '@mui/material';
import { Paper } from '@mui/material';
import { Chip } from '@mui/material';

export default function ChannelPlan() {
	const context = useContext(YangDataContext);
	const { model } = context;
	const channelPlan = model['czechlight-roadm-device:channel-plan'];
	if (!channelPlan) return null;

	const channel = channelPlan.channel;
	const rows = channel.map((channel) => {
		const l = (C * 1000) / channel['lower-frequency'];
		const u = (C * 1000) / channel['upper-frequency'];
		const lambda = Number((l + u) / 2).toFixed(2);
		return (
			<TableRow key={channel.name}>
				<TableCell>{channel.name}</TableCell>
				<TableCell>{channel['lower-frequency']}</TableCell>
				<TableCell>{channel['upper-frequency']}</TableCell>
				<TableCell>{lambda}</TableCell>
			</TableRow>
		);
	});
	return (
		<Page title="Channel Plan">
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>
								Lower Frequency <Chip label="Mhz" color="secondary"></Chip>
							</TableCell>
							<TableCell>
								Upper Frequency <Chip label="Mhz" color="secondary"></Chip>
							</TableCell>
							<TableCell>
								Central WL <Chip label="nm" color="secondary"></Chip>
							</TableCell>
						</TableRow>
					</TableHead>
					{rows}
				</Table>
			</TableContainer>
		</Page>
	);
}
