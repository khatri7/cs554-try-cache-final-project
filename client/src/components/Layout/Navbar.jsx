import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	Avatar,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { handleError, logout } from 'utils/api-calls';
import { unsetUser } from 'store/user';
import { errorAlert } from 'store/alert';
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

	const [anchorElUser, setAnchorElUser] = React.useState(null);

	const user = useSelector((state) => state.user);

	const dispatch = useDispatch();

	const isLoggedIn = React.useMemo(() => {
		return user !== null;
	}, [user]);

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

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
						<Box sx={{ flexGrow: 0 }}>
							{isLoggedIn ? (
								<>
									<IconButton
										component="div"
										onClick={handleOpenUserMenu}
										sx={{ p: 0 }}
									>
										<Avatar
											alt={`${user.firstName} ${user.lastName}`}
											src="/broken-image.jpg"
										/>
									</IconButton>
									<Menu
										sx={{ mt: '45px' }}
										anchorEl={anchorElUser}
										anchorOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
										keepMounted
										transformOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
										open={Boolean(anchorElUser)}
										onClose={handleCloseUserMenu}
									>
										<MenuItem
											onClick={async () => {
												handleCloseUserMenu();
												navigate('/my-applications');
											}}
										>
											<Typography textAlign="center">
												My Applications
											</Typography>
										</MenuItem>

										<MenuItem
											onClick={async () => {
												handleCloseUserMenu();
												navigate('/dashboard');
											}}
										>
											<Typography textAlign="center">View Dashboard</Typography>
										</MenuItem>

										<MenuItem
											onClick={async () => {
												handleCloseUserMenu();
												try {
													await logout();
													dispatch(unsetUser());
												} catch (e) {
													let error = 'Unexpected error occurred';
													if (typeof handleError(e) === 'string')
														error = handleError(e);
													dispatch(errorAlert(error));
												}
											}}
										>
											<Typography textAlign="center">Log Out</Typography>
										</MenuItem>
									</Menu>
								</>
							) : (
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
							)}
						</Box>
					</Stack>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default Navbar;
