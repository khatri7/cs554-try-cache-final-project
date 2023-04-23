import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
// import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import Logo from './logo.png';

const pages = [
	{
		title: 'Listings',
		route: '/listings',
	},
];

function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<AppBar
			sx={{
				backgroundColor: 'rgba(255,255,255,0.8)',
				backdropFilter: 'blur(20px)',
			}}
			position="sticky"
		>
			<Container>
				<Toolbar disableGutters>
					<Stack
						justifyContent="space-between"
						direction="row"
						alignItems="center"
						sx={{
							width: '100%',
						}}
					>
						{/* Desktop Menu */}
						<Box
							sx={{
								minHeight: 64,
								display: { xs: 'none', md: 'flex' },
								gap: 4,
							}}
						>
							{pages.map((page) => (
								<Button
									key={page.title}
									onClick={() => {
										navigate(page.route);
									}}
									sx={{
										py: 2,
										display: 'block',
										borderRadius: 0,
										color: 'black',
										'&:disabled': {
											borderTop: (theme) =>
												`3px solid ${theme.palette.primary.main}`,
											color: (theme) => theme.palette.primary.main,
											pt: '13px',
										},
									}}
									disabled={Boolean(location.pathname === page.route)}
								>
									{page.title}
								</Button>
							))}
						</Box>
						{/* Desktop Icon */}
						<Box
							sx={{
								display: { xs: 'none', md: 'flex' },
								justifyContent: 'center',
								flex: '0 0 auto',
							}}
						>
							<Link to="/">
								<img
									src={Logo}
									alt="Try&Cache"
									style={{
										height: '3rem',
									}}
								/>
							</Link>
						</Box>
						{/* User Menu */}
						<Box>
							<Button
								variant="contained"
								size="large"
								type="button"
								startIcon={<LoginOutlinedIcon />}
								onClick={() => {
									navigate('/login');
								}}
							>
								LOGIN
							</Button>
						</Box>
					</Stack>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default Navbar;
