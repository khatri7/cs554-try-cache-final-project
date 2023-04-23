import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Box, Button, Stack, Typography } from '@mui/material';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { getLocationDetails, getSelectedAreaCoordinates } from 'utils/helpers';

const libraries = ['places'];

function Listings() {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
	});

	if (!isLoaded) return <Typography>Loading...</Typography>;

	return (
		<>
			<PlacesAutocomplete
				onSelect={async (location) => {
					const formattedLocation = await getLocationDetails(location);
					console.log(formattedLocation);
				}}
			/>
			<Box sx={{ height: '2rem' }} />
			<Stack direction="row" gap={2}>
				<PlacesAutocomplete
					types={['locality']}
					cacheKey="locality"
					label="Locality"
					placeholder="Start typing name of a locality"
					onSelect={async (location) => {
						const coordinates = await getSelectedAreaCoordinates(location);
						console.log(coordinates);
					}}
				/>
				<Button variant="outlined">Search</Button>
			</Stack>
		</>
	);
}

export default Listings;
