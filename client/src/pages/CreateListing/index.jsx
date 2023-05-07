import PlacesAutocomplete from 'components/PlacesAutocomplete';
import React, { useState } from 'react';
import {
	getLocationDetails,
	isValidBedBath,
	isValidNum,
	isValidStr,
} from 'utils/helpers';
import {
	Box,
	Button,
	TextField,
	FormControl,
	FormControlLabel,
	FormLabel,
	RadioGroup,
	Radio,
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
		deposit: '',
		petPolicy: '',
		laundry: '',
		parking: '',
		availabilityDate: null,
		location: {},
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
				apt,
				description,
				bedrooms,
				bathrooms,
				squareFoot,
				rent,
				deposit,
			} = formValues;
			isValidStr(description);
			isValidNum(apt, 'min', 1);
			isValidNum(bedrooms, 'min', 0);
			isValidNum(bathrooms, 'min', 1);
			isValidBedBath(bedrooms);
			isValidBedBath(bathrooms);
			isValidNum(rent, 'min', 100);
			isValidNum(deposit, 'min', 0);
			isValidNum(squareFoot, 'min', 100);
			const res = await POST('/listings', formValues);
			if (res && res.listing._id) {
				navigate(`/listings/${res.listing._id}`);
			}
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		}
	};

	return (
		<Box>
			<Box
				sx={{
					minHeight: '60vh',
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'between',
					gap: 4,
				}}
			>
				<form onSubmit={handleSubmit}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2,
							minWidth: '500px',
						}}
					>
						<TextField
							required
							name="apt"
							type="number"
							label="Apartment Number"
							value={formValues.apt}
							onChange={handleChange}
						/>
						<TextField
							name="description"
							label="Description"
							value={formValues.description}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="bedrooms"
							label="Bedrooms"
							value={formValues.bedrooms}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="bathrooms"
							label="Bathrooms"
							value={formValues.bathrooms}
							onChange={handleChange}
						/>
						<TextField
							type="number"
							name="squareFoot"
							label="Square foot in sq.ft"
							value={formValues.squareFoot}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="rent"
							label="Rent"
							value={formValues.rent}
							onChange={handleChange}
						/>
						<TextField
							required
							type="number"
							name="deposit"
							label="Deposit"
							value={formValues.deposit}
							onChange={handleChange}
						/>
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
						<FormControl fullWidth>
							<LocalizationProvider dateAdapter={AdapterMoment}>
								<DatePicker
									label="Availability Date"
									value={formValues.availabilityDate}
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
						<PlacesAutocomplete
							name="location"
							onChange={async (location) => {
								const formattedLocation = await getLocationDetails(location);
								formValues.location = formattedLocation;
							}}
						/>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							disabled={isDisabled}
						>
							Submit
						</Button>
					</Box>
				</form>
			</Box>
		</Box>
	);
}

export default CreateListing;
