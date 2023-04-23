import { Container } from '@mui/material';
import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
	return (
		<>
			<Navbar />
			<Container
				sx={{
					py: 4,
				}}
			>
				{children}
			</Container>
		</>
	);
}

export default Layout;
