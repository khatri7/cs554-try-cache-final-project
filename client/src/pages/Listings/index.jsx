import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { getSelectedAreaCoordinates } from 'utils/helpers';
import { getListings } from 'utils/api-calls';
import ListingCard from 'components/ListingCard';
import { useLocation } from 'react-router-dom';

function Listings() {
	const location = useLocation();

	const locationFromHome = location?.state?.location;

	const [loading, setLoading] = useState(false);
	const [areaSelected, setAreaSelected] = useState(null);
	const [listings, setListings] = useState([]);

	const handleSearch = async (selectedLocation) => {
		try {
			setLoading(true);
			setAreaSelected(selectedLocation);
			if (selectedLocation) {
				const coordinates = await getSelectedAreaCoordinates(selectedLocation);
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

	useEffect(() => {
		if (locationFromHome) {
			handleSearch(locationFromHome);
		}
	}, [locationFromHome]);

	useEffect(
		() => () => {
			window.history.replaceState({}, document.title);
		},
		[]
	);

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
			<Box sx={{ my: '2rem' }}>
				{areaSelected && (
					<Typography>
						Showing results for:{' '}
						<span
							style={{
								fontWeight: 'bold',
							}}
						>
							{areaSelected?.description}
						</span>
					</Typography>
				)}
			</Box>
			{!areaSelected && !loading && (
				<Typography>Select a locality to view listings</Typography>
			)}
			{loading && <Typography>Loading...</Typography>}
			{!loading && Boolean(areaSelected) && listings.length === 0 && (
				<Typography>
					Currently there are no listings in the selected area
				</Typography>
			)}
			<Stack gap={4}>
				{listings.map((listing) => (
					<ListingCard key={listing._id} listing={listing} />
				))}
			</Stack>
		</Box>
	);
}

export default Listings;
