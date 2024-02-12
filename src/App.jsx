import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Menu from './layout/Menu/Menu';
import AppBar from './layout/AppBar/AppBar';
import Router from '@/Router/Router';
import CssBaseline from '@mui/material/CssBaseline';
import Copyright from './components/Copyright/Copyright';
import { styled } from '@mui/material/styles';
import Theme from './layout/Theme/Theme';
import useLayout from '@/hooks/useLayout';
import YangDataProvider from './contexts/YangDataContext';

export default function Dashboard() {
	const { isMobile } = useLayout();
	const [open, setOpen] = useState(!isMobile);
	const toggleMenu = () => {
		setOpen(!open);
	};

	useEffect(() => {
		setOpen(!isMobile);
	}, [isMobile]);

	return (
		<ThemeProvider theme={Theme}>
			<YangDataProvider>
				<Box sx={{ display: 'flex', overflow: open && isMobile ? 'hidden' : 'auto' }}>
					<CssBaseline />
					<AppBar open={open} toggleMenu={toggleMenu} />
					<Menu open={open} toggleMenu={toggleMenu} />
					<StyledMain component="main" open={open}>
						<Router />
						<Copyright sx={{ pt: 4 }} />
					</StyledMain>
				</Box>
			</YangDataProvider>
		</ThemeProvider>
	);
}

const StyledMain = styled(Box)(({ theme, open }) => ({
	backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
	flexGrow: 1,
	minHeight: '100vh',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	[theme.breakpoints.down('sm')]: {
		overflow: open ? 'visible' : 'auto',
	},
}));
