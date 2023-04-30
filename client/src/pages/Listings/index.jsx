import React, { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Box, Stack, Typography } from '@mui/material';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { getSelectedAreaCoordinates } from 'utils/helpers';
import { getListings } from 'utils/api-calls';
import ListingCard from 'components/ListingCard';

const libraries = ['places'];

function Listings() {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
	});

	const [loading, setLoading] = useState(false);
	const [areaSelected, setAreaSelected] = useState(false);
	const [listings, setListings] = useState([]);

	if (!isLoaded) return <Typography>Loading...</Typography>;

	const handleSearch = async (location) => {
		try {
			setLoading(true);
			setAreaSelected(Boolean(location));
			if (location) {
				const coordinates = await getSelectedAreaCoordinates(location);
				const listingsArr = await getListings(coordinates);
				if (!listingsArr.listings) throw new Error();
				setListings(listingsArr.listings);
			} else {
				setListings([]);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Stack direction="row" gap={2}>
				<PlacesAutocomplete
					types={['locality']}
					cacheKey="locality"
					label="Locality"
					placeholder="Start typing name of a locality"
					onChange={handleSearch}
				/>
			</Stack>
			<Box sx={{ height: '2rem' }} />
			{!areaSelected && !loading && (
				<Typography>Select a locality to view listings</Typography>
			)}
			{loading && <Typography>Loading...</Typography>}
			{!loading && areaSelected && listings.length === 0 && (
				<Typography>
					Currently there are no listings in the selected area
				</Typography>
			)}
			<Stack>
				{listings.map((listing) => (
					<ListingCard key={listing._id} listing={listing} />
				))}
			</Stack>
		</Box>
	);
}

export default Listings;
