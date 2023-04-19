import { Container } from '@mui/material';
import React from 'react';

function Layout({ children }) {
	return (
		<Container
			sx={{
				py: 4,
			}}
		>
			{children}
		</Container>
	);
}

export default Layout;
