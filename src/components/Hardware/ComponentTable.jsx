import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Chip, Typography } from '@mui/material';
import Sensor from './Sensor';
import { Component } from 'react';

export default function ComponentTable({ component, sensors }) {
	return (
		<TableContainer sx={{ maxWidth: 500 }} component={Paper}>
			<Table size="small" aria-label="a dense table">
				<TableHead sx={{ backgroundColor: '#0068A2' }}>
					<TableRow>
						<TableCell>
							<TableTitle component={component} />
						</TableCell>
						<TableCell align="left">
							<Chip label={component.name} color="primary"></Chip>
							<Chip label={component.class} color="success"></Chip>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{component['model-name'] && (
						<TableRow>
							<TableCell component="th" scope="row" fontWeight="bold">
								Model Name
							</TableCell>
							<TableCell>{component['model-name']}</TableCell>
						</TableRow>
					)}
					{component['description'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Description
							</TableCell>
							<TableCell>{component['description']}</TableCell>
						</TableRow>
					)}
					{component['firmware-rev'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Firmware Revision
							</TableCell>
							<TableCell>{component['firmware-rev']}</TableCell>
						</TableRow>
					)}
					{component['hardware-rev'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Hardware Revision
							</TableCell>
							<TableCell>{component['hardware-rev']}</TableCell>
						</TableRow>
					)}
					{component['serial-num'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Serial Number
							</TableCell>
							<TableCell>{component['serial-num']}</TableCell>
						</TableRow>
					)}
					{component['mfg-name'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Manufacturer
							</TableCell>
							<TableCell>{component['mfg-name']}</TableCell>
						</TableRow>
					)}
					{component['mfg-date'] && (
						<TableRow>
							<TableCell component="th" scope="row">
								Manufactured Date
							</TableCell>
							<TableCell>{component['mfg-date']}</TableCell>
						</TableRow>
					)}
					{sensors && sensors.map((sensor) => Sensor(sensor))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

ComponentTable.propTypes = {
	component: Component,
	sensors: Component,
};

function TableTitle({ component }) {
	return <Typography color={'primary'}>{component.name.split(':').pop().toUpperCase()}</Typography>;
}

TableTitle.propTypes = {
	component: Component,
};
