import PlacesAutocomplete from 'components/PlacesAutocomplete';
import React, { useState } from 'react';
import { getLocationDetails, isValidNum, isValidStr } from 'utils/helpers';
import {
	Box,
	Button,
	TextField,
	FormControl,
	FormControlLabel,
	FormLabel,
	RadioGroup,
	Radio,
	Stack,
} from '@mui/material';
import { POST, handleError } from 'utils/api-calls';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { errorAlert } from 'store/alert';
import { useDispatch } from 'react-redux';

function CreateListing() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [formValues, setFormValues] = useState({
		apt: '',
		description: '',
		bedrooms: '',
		bathrooms: '',
		squareFoot: '',
		rent: '',
		deposit: 0,
		petPolicy: '',
		laundry: '',
		parking: '',
		availabilityDate: null,
		location: null,
	});

	const [isDisabled, setIsDisabled] = useState(false);

	const handleChange = (event) => {
		setIsDisabled(false);
		const { name, value, type } = event.target;
		setFormValues({
			...formValues,
			[name]: type === 'number' ? parseInt(value, 10) : value,
		});
	};

	const handleSubmit = async (event) => {
		try {
			setIsDisabled(true);
			event.preventDefault();
			const {
				location,
				apt,
				description,
				bedrooms,
				bathrooms,
				squareFoot,
				rent,
				deposit,
			} = formValues;
			if (!location) throw new Error('Street Address is required');
			if (description.trim() && !isValidStr(description))
				throw new Error('Invalid Description');
			if (apt !== '' && !isValidNum(apt, 'min', 1))
				throw new Error('Invalid Apartment');
			if (!isValidNum(bedrooms, 'min', 0) || !isValidNum(bedrooms, 'max', 20))
				throw new Error('Invalid Bedrooms, should be between 0-20');
			if (!isValidNum(bathrooms, 'min', 1) || !isValidNum(bathrooms, 'max', 20))
				throw new Error('Invalid Bathrooms, should be between 1-20');
			if (!isValidNum(rent, 'min', 100))
				throw new Error('Invalid Rent, should at least 100');
			if (!isValidNum(deposit, 'min', 0)) throw new Error('Invalid Deposit');
			if (squareFoot !== '' && !isValidNum(squareFoot, 'min', 100))
				throw new Error('Invalid area, should be at least 100 sq.ft');
			const res = await POST('/listings', formValues);
			if (res && res.listing._id) {
				navigate(`/listings/${res.listing._id}`);
			}
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		} finally {
			setIsDisabled(false);
		}
	};

	return (
		<Box>
			<form onSubmit={handleSubmit}>
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
					<PlacesAutocomplete
						name="location"
						label="Street Address *"
						onChange={async (location) => {
							const formattedLocation = await getLocationDetails(location);
							formValues.location = formattedLocation;
						}}
					/>
					<Stack direction="row" gap={4} sx={{ width: '100%' }}>
						<TextField
							name="apt"
							fullWidth
							type="number"
							label="Apartment Number"
							value={formValues.apt}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="bedrooms"
							label="Bedrooms"
							fullWidth
							value={formValues.bedrooms}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="bathrooms"
							label="Bathrooms"
							fullWidth
							value={formValues.bathrooms}
							onChange={handleChange}
						/>
						<TextField
							type="number"
							name="squareFoot"
							label="Area (sq.ft)"
							value={formValues.squareFoot}
							onChange={handleChange}
							fullWidth
						/>
					</Stack>
					<TextField
						name="description"
						label="Description"
						multiline
						minRows={4}
						fullWidth
						value={formValues.description}
						onChange={handleChange}
					/>
					<Stack direction="row" gap={4} sx={{ width: '100%' }}>
						<TextField
							required
							type="number"
							name="rent"
							label="Rent"
							value={formValues.rent}
							onChange={handleChange}
							fullWidth
						/>
						<TextField
							required
							type="number"
							name="deposit"
							label="Deposit"
							value={formValues.deposit}
							onChange={handleChange}
							fullWidth
						/>
						<FormControl fullWidth>
							<LocalizationProvider dateAdapter={AdapterMoment}>
								<DatePicker
									label="Availability Date"
									value={
										formValues.availabilityDate
											? moment(formValues.availabilityDate)
											: null
									}
									format="MM-DD-YYYY"
									minDate={moment()}
									onChange={(newValue) => {
										setFormValues({
											...formValues,
											availabilityDate: newValue
												? newValue.format('MM-DD-YYYY')
												: null,
										});
									}}
								/>
							</LocalizationProvider>
						</FormControl>
					</Stack>
					<Stack direction="row" gap={4} sx={{ width: '100%' }}>
						<FormControl fullWidth>
							<FormLabel component="legend">Pet Policy</FormLabel>
							<RadioGroup
								aria-label="petPolicy"
								name="petPolicy"
								value={formValues.petPolicy}
								onChange={handleChange}
							>
								<FormControlLabel
									value="allowed"
									control={<Radio />}
									label="Pets Allowed"
								/>
								<FormControlLabel
									value="notAllowed"
									control={<Radio />}
									label="Pets Not Allowed"
								/>
							</RadioGroup>
						</FormControl>
						<FormControl fullWidth>
							<FormLabel component="legend">Laundry</FormLabel>
							<RadioGroup
								aria-label="laundry"
								name="laundry"
								value={formValues.laundry}
								onChange={handleChange}
							>
								<FormControlLabel
									value="inunit"
									control={<Radio />}
									label="In Unit"
								/>
								<FormControlLabel
									value="shared"
									control={<Radio />}
									label="Shared"
								/>
								<FormControlLabel
									value="notavailable"
									control={<Radio />}
									label="Not Available"
								/>
							</RadioGroup>
						</FormControl>
						<FormControl fullWidth>
							<FormLabel component="legend">Parking</FormLabel>
							<RadioGroup
								aria-label="Parking"
								name="parking"
								value={formValues.parking}
								onChange={handleChange}
							>
								<FormControlLabel
									value="available"
									control={<Radio />}
									label="Parking Available"
								/>
								<FormControlLabel
									value="notavailable"
									control={<Radio />}
									label="Parking Not Available"
								/>
							</RadioGroup>
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
						Submit
					</Button>
				</Box>
			</form>
		</Box>
	);
}

export default CreateListing;
