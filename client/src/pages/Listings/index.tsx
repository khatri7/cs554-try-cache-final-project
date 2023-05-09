import React, { useEffect, useState } from 'react';
import {
	Box,
	Stack,
	Typography,
	Button,
	Popover,
	TextField,
	FormControl,
	FormLabel,
	FormControlLabel,
	Checkbox,
} from '@mui/material';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { getSelectedAreaCoordinates, isValidNum } from 'utils/helpers';
import { getListings, handleError } from 'utils/api-calls';
import ListingCard from 'components/ListingCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorAlert } from 'store/alert';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { GoogleMap, MarkerF as Marker } from '@react-google-maps/api';
import { useAppDispatch } from 'hooks';
import { Suggestion } from 'use-places-autocomplete';
import { Listing } from 'utils/types/listing';

const Listings: React.FC<{}> = () => {
	const location = useLocation();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const locationFromHome = location?.state?.location;

	const [loading, setLoading] = useState<boolean>(false);
	const [areaSelected, setAreaSelected] = useState<null | Suggestion>(null);
	const [listings, setListings] = useState<Array<Listing>>([]);
	const [filteredListings, setFilteredListings] =
		useState<null | Array<Listing>>([]);
	const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
	const [filterValues, setFilterValues] = useState({
		bedrooms: '',
		squareFoot: '',
		rent: '',
		petPolicy: false,
		inUnitLaundry: false,
		sharedLaundry: false,
		parking: false,
	});
	const [isDisabled, setIsDisabled] = useState(false);
	const [filterEl, setFilterEl] = useState<null | HTMLButtonElement>(null);

	const handleOpenFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
		setFilterEl(event.currentTarget);
	};

	const handleCloseFilters = () => {
		setFilterEl(null);
	};

	const open = Boolean(filterEl);
	const id = open ? 'filter-popover' : undefined;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsDisabled(false);
		const { name } = event.target;
		let { value, type }: { value: boolean | string; type: string } =
			event.target;
		if (value === '') type = 'change';
		if (type === 'checkbox') {
			value = event.target.checked;
		}
		setFilterValues({
			...filterValues,
			[name]: type === 'number' ? parseInt(value as string, 10) : value,
		});
	};

	const handleApplyFilter = async (event: React.SyntheticEvent) => {
		try {
			setFiltersApplied(true);
			setIsDisabled(true);
			event.preventDefault();
			const { bedrooms, squareFoot, rent } = filterValues;
			if (!areaSelected) throw new Error('Please Select a Location first');
			if (
				bedrooms !== '' &&
				(!isValidNum(Number(bedrooms), 'min', 0) ||
					!isValidNum(Number(bedrooms), 'max', 20))
			)
				throw new Error('Invalid Bedrooms, should be between 0-20');
			if (rent !== '' && !isValidNum(Number(rent), 'min', 100))
				throw new Error('Invalid Rent, should at least 100');
			if (squareFoot !== '' && !isValidNum(Number(squareFoot), 'min', 100))
				throw new Error('Invalid area, should be at least 100 sq.ft');
			const filteredResults: Array<Listing> = [];
			listings.forEach((data) => {
				let flag = true;
				if (
					filterValues.bedrooms &&
					data.bedrooms !== Number(filterValues.bedrooms)
				)
					flag = false;
				if (
					filterValues.squareFoot &&
					data.squareFoot < Number(filterValues.squareFoot)
				)
					flag = false;
				if (filterValues.rent && data.rent > Number(filterValues.rent))
					flag = false;
				if (filterValues.petPolicy && data.petPolicy !== 'allowed')
					flag = false;
				if (filterValues.sharedLaundry && data.laundry !== 'shared')
					flag = false;
				if (filterValues.inUnitLaundry && data.laundry !== 'inunit')
					flag = false;
				if (filterValues.parking && data.parking !== 'allowed') flag = false;
				if (flag) filteredResults.push(data);
			});
			setFilteredListings(filteredResults);
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		} finally {
			setIsDisabled(false);
		}
	};

	const handleSearch = async (selectedLocation: Suggestion) => {
		try {
			setFiltersApplied(false);
			setFilteredListings(null);
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
				<Button
					aria-describedby={id}
					variant="contained"
					onClick={handleOpenFilters}
				>
					<FilterAltIcon />
					Filters
				</Button>
			</Stack>

			<Popover
				id={id}
				open={open}
				anchorEl={filterEl}
				onClose={handleCloseFilters}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<Typography sx={{ p: 2 }} component="legend">
					<Box>
						<form onSubmit={handleApplyFilter}>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 4,
									minWidth: '500px',
								}}
							>
								<Stack direction="row" gap={4} sx={{ width: '100%' }}>
									<TextField
										type="number"
										name="bedrooms"
										label="Bedrooms"
										fullWidth
										value={filterValues.bedrooms}
										onChange={handleChange}
									/>
									<TextField
										type="number"
										name="squareFoot"
										label="Minimum Area (sq.ft)"
										value={filterValues.squareFoot}
										onChange={handleChange}
										fullWidth
									/>
									<TextField
										type="number"
										name="rent"
										label="Maximum Rent"
										value={filterValues.rent}
										onChange={handleChange}
										fullWidth
									/>
								</Stack>
								<Stack direction="row" gap={4} sx={{ width: '100%' }}>
									<FormControl fullWidth>
										<FormLabel component="legend">Pet Policy</FormLabel>
										<FormControlLabel
											name="petPolicy"
											control={
												<Checkbox
													checked={filterValues.petPolicy}
													onChange={handleChange}
												/>
											}
											label="Pets Allowed"
										/>
									</FormControl>
									<FormControl fullWidth>
										<FormLabel component="legend">Laundry</FormLabel>
										<FormControlLabel
											name="inUnitLaundry"
											control={
												<Checkbox
													checked={filterValues.inUnitLaundry}
													onChange={handleChange}
												/>
											}
											label="In Unit"
										/>
										<FormControlLabel
											name="sharedLaundry"
											control={
												<Checkbox
													checked={filterValues.sharedLaundry}
													onChange={handleChange}
												/>
											}
											label="Shared"
										/>
									</FormControl>
									<FormControl fullWidth>
										<FormLabel component="legend">Parking</FormLabel>
										<FormControlLabel
											name="parking"
											control={
												<Checkbox
													checked={filterValues.parking}
													onChange={handleChange}
												/>
											}
											label="Parking Available"
										/>
									</FormControl>
								</Stack>
								<Button
									variant="contained"
									color="primary"
									type="submit"
									size="large"
									sx={{
										alignSelf: 'flex-end',
										mt: 6,
									}}
									disabled={isDisabled}
								>
									Apply Filters
								</Button>
							</Box>
						</form>
					</Box>
				</Typography>
			</Popover>
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
			{filtersApplied && filteredListings?.length === 0 && (
				<Typography>
					Currently there are no listings that match the filters applied
				</Typography>
			)}
			<Stack gap={4}>
				{filtersApplied && (
					<>
						{filteredListings?.length && filteredListings.length > 0 && (
							<Box>
								<GoogleMap
									mapContainerStyle={{ height: '240px' }}
									zoom={11}
									center={{
										lat: listings[0].location.lat,
										lng: listings[0].location.lng,
									}}
								>
									{filteredListings?.map((listing) => (
										<Marker
											key={listing._id}
											position={{
												lat: listing.location.lat,
												lng: listing.location.lng,
											}}
										/>
									))}
								</GoogleMap>
							</Box>
						)}
						{filteredListings?.map((listing) => (
							<ListingCard key={listing._id} listing={listing} />
						))}
					</>
				)}
				{!filtersApplied && (
					<>
						{listings.length > 0 && (
							<Box>
								<GoogleMap
									mapContainerStyle={{ height: '240px' }}
									zoom={11}
									center={{
										lat: listings[0].location.lat,
										lng: listings[0].location.lng,
									}}
								>
									{listings.map((listing) => (
										<Marker
											onClick={() => {
												navigate(`/listings/${listing._id}`);
											}}
											key={listing._id}
											position={{
												lat: listing.location.lat,
												lng: listing.location.lng,
											}}
										/>
									))}
								</GoogleMap>
							</Box>
						)}
						{listings.map((listing) => (
							<ListingCard key={listing._id} listing={listing} />
						))}
					</>
				)}
			</Stack>
		</Box>
	);
};

export default Listings;
