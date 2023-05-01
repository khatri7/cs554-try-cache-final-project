import PlacesAutocomplete from 'components/PlacesAutocomplete';
import React, { useState } from 'react';
import {
	getLocationDetails,
	isValidApt,
	isValidBedBath,
	isValidDateStr,
	isValidDescription,
	isValidRentDeposit,
} from 'utils/helpers';
import { Box, Button, TextField, FormControl } from '@mui/material';
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
		rent: '',
		deposit: '',
		availabilityDate: null,
		location: {},
	});

	const [isDisabled, setIsDisabled] = useState(false);

	const handleChange = (event) => {
		const { name, value, type } = event.target;
		setIsDisabled(false);
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
				rent,
				deposit,
				availabilityDate,
			} = formValues;
			isValidDateStr(availabilityDate);
			isValidDescription(description);
			isValidApt(apt);
			isValidBedBath(bedrooms);
			isValidBedBath(bathrooms);
			isValidRentDeposit(rent);
			isValidRentDeposit(deposit);
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
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
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
