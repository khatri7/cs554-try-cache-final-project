import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Typography } from '@mui/material';
import PlacesAutocomplete from 'components/PlacesAutocomplete';

const libraries = ['places'];

function Listings() {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
	});

	if (!isLoaded) return <Typography>Loading...</Typography>;

	return <PlacesAutocomplete />;
}

export default Listings;
