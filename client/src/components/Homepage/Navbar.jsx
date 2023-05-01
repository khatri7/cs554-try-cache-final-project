import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HomeIcon from '@mui/icons-material/Home';
import ContactsIcon from '@mui/icons-material/Contacts';
import { Container } from '@mui/system';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/joy/Button';
import { styled } from '@mui/material/styles';

import { useState } from 'react';
// import { LinkOffTwoTone } from '@mui/icons-material';
import logoImg from 'components/Homepage/logoImg.png';
// import StyledButton from './StyledButton';
import { useNavigate } from 'react-router-dom';

function Navbar() {
	const [mobileMenu, setMobileMenu] = useState({
		left: false,
	});

	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === 'keydown' &&
			(event.type === 'Tab' || event.type === 'Shift')
		) {
			return;
		}

		setMobileMenu({ ...mobileMenu, [anchor]: open });
	};

	const list = (anchor) => (
		<Box
			sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
			role="presentation"
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<List>
				{['Home', 'Features', 'Services', 'Listed', 'Contact'].map(
					(text, index) => (
						<ListItem key={text} disablePadding>
							<ListItemButton>
								<ListItemIcon>
									{index === 0 && <HomeIcon />}
									{index === 1 && <FeaturedPlayListIcon />}
									{index === 2 && <MiscellaneousServicesIcon />}
									{index === 3 && <ListAltIcon />}
									{index === 4 && <ContactsIcon />}
								</ListItemIcon>
								<ListItemText primary={text} />
							</ListItemButton>
						</ListItem>
					)
				)}
			</List>
		</Box>
	);

	const NavLink = styled(Typography)(() => ({
		fontSize: '14px',
		color: '#4F5361',
		fontWeight: 'bold',
		cursor: 'pointer',
		'&:hover': {
			color: '#fff',
		},
	}));

	const NavbarLinksBox = styled(Box)(({ theme }) => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: theme.spacing(3),
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	}));

	const CustomMenuIcon = styled(MenuIcon)(({ theme }) => ({
		cursor: 'pointer',
		display: 'none',
		marginRight: theme.spacing(2),
		[theme.breakpoints.down('md')]: {
			display: 'block',
		},
	}));

	const NavbarContainer = styled(Container)(({ theme }) => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: theme.spacing(5),
		[theme.breakpoints.down('md')]: {
			padding: theme.spacing(2),
		},
	}));

	const NavbarLogo = styled('img')(({ theme }) => ({
		cursor: 'pointer',
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	}));
	const navigate = useNavigate();
	return (
		<NavbarContainer>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '2.5rem',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<CustomMenuIcon onClick={toggleDrawer('left', true)} />
					<Drawer
						anchor="left"
						open={mobileMenu.left}
						onClose={toggleDrawer('left', false)}
					>
						{list('left')}
					</Drawer>
					<NavbarLogo src={logoImg} alt="logo" />
				</Box>

				<NavbarLinksBox>
					<NavLink variant="body2">Home</NavLink>
					<NavLink variant="body2">Features</NavLink>
					<NavLink variant="body2">Services</NavLink>
					<NavLink variant="body2">Listed</NavLink>
					<NavLink variant="body2">Contact</NavLink>
				</NavbarLinksBox>
			</Box>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '1rem',
				}}
			>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<Button onClick={() => navigate('/signup')}>Signup</Button>
				</Box>
			</Box>
		</NavbarContainer>
	);
}

export default Navbar;
