import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from 'utils/helpers';
import Loader from 'components/Loader';
import Alert from 'components/Alert';
import { useLoadScript } from '@react-google-maps/api';
import Navbar from './Navbar';

const libraries = ['places'];

function Layout({ children }) {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
	});
	const appInitialized = useSelector((state) => state.app.appInitialized);
	const dispatch = useDispatch();
	useEffect(() => {
		if (!appInitialized) autoLogin(dispatch);
	}, [appInitialized, dispatch]);
	if (!appInitialized || !isLoaded) return <Loader />;
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
