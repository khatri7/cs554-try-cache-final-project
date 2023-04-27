import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from 'utils/helpers';
import Loader from 'components/Loader';
import Alert from 'components/Alert';
import Navbar from './Navbar';

function Layout({ children }) {
	const appInitialized = useSelector((state) => state.app.appInitialized);
	const dispatch = useDispatch();
	useEffect(() => {
		if (!appInitialized) autoLogin(dispatch);
	}, [appInitialized, dispatch]);
	if (!appInitialized) return <Loader />;
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
			<Alert />
		</>
	);
}

export default Layout;
