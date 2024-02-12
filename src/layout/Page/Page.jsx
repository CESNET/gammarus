import { Container, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Leds from '@/components/Leds/Leds';
import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { YangDataContext } from '@/contexts/YangDataContext';

export default function Page({ title, children }) {
	useEffect(() => {
		document.title = title;
	}, [title]);

	const { model } = useContext(YangDataContext);
	if (!model) return null;
	return (
		<Container
			maxWidth="lg"
			sx={{
				marginBottom: 4,
				marginTop: {
					xs: 5,
					sm: 5,
					md: 1,
				},
			}}
		>
			<Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'flexStart', gap: 1, position: 'relative', zIndex: '999999' }}>
				<Typography component="h1" variant="h4" fontWeight={700} noWrap>
					{title}
				</Typography>
				<Divider orientation="vertical" variant="middle" flexItem />
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flexStart',
						justifyContent: 'flex-start',
						gap: 0,
					}}
				>
					<div>{model['ietf-system:system']?.hostname}</div>
					{/* <div>{model['ietf-system:system']?.hostname}</div> */}
				</Box>
			</Box>
			<Leds />
			<Divider sx={{ marginBottom: 2, marginTop: 1 }} />
			{children}
		</Container>
	);
}

Page.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};
