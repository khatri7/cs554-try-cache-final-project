import React, { useMemo, useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import parse from 'autosuggest-highlight/parse';
import {
	Autocomplete,
	Box,
	FormControl,
	Grid,
	TextField,
	Typography,
} from '@mui/material';

function PlacesAutocomplete({
	types = ['premise', 'street_address'],
	cacheKey = 'streetAddress',
	placeholder = 'Start typing address',
	label = 'Street Address',
	onChange = () => {},
}) {
	const [selectedValue, setSelectedValue] = useState(null);

	const {
		ready,
		setValue,
		suggestions: { data, status, loading },
	} = usePlacesAutocomplete({
		requestOptions: {
			types,
			componentRestrictions: { country: ['us'] },
		},
		defaultValue: selectedValue?.description ?? '',
		cacheKey,
	});

	const handleLocationSelect = async (e, location) => {
		if (location) {
			await onChange(location);
			setValue(location.description, false);
			setSelectedValue(location);
		}
	};

	const handleInputChange = async (event, value) => {
		setValue(value);
		if ((!value || value?.trim() === '') && selectedValue !== null) {
			setSelectedValue(null);
			await onChange(null);
		}
	};

	const autoCompleteOptions = useMemo(() => {
		if (status === 'OK') return data;
		return [];
	}, [data, status]);

	return (
		<Box sx={{ width: '100%' }}>
			<FormControl fullWidth>
				<Autocomplete
					forcePopupIcon={false}
					disabled={!ready}
					loading={loading}
					autoComplete
					id="address-autocomplete"
					onChange={handleLocationSelect}
					value={selectedValue}
					onInputChange={handleInputChange}
					options={autoCompleteOptions}
					getOptionLabel={(option) =>
						typeof option === 'string' ? option : option.description
					}
					isOptionEqualToValue={(option, value) =>
						option.place_id === value.place_id
					}
					noOptionsText="No locations"
					filterOptions={(options) => options}
					renderOption={(props, option) => {
						const matches =
							option.structured_formatting?.main_text_matched_substrings || [];

						const parts = parse(
							option.structured_formatting?.main_text,
							matches.map((match) => [
								match.offset,
								match.offset + match.length,
							])
						);

						return (
							<li {...props}>
								<Grid container alignItems="center">
									<Grid item sx={{ display: 'flex', width: 44 }}>
										<LocationOnIcon sx={{ color: 'text.secondary' }} />
									</Grid>
									<Grid
										item
										sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}
									>
										{parts.map((part, index) => (
											<Box
												// eslint-disable-next-line react/no-array-index-key
												key={index}
												component="span"
												sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
											>
												{part.text}
											</Box>
										))}
										<Typography variant="body2" color="text.secondary">
											{option.structured_formatting?.secondary_text}
										</Typography>
									</Grid>
								</Grid>
							</li>
						);
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder={placeholder}
							label={label}
							sx={{
								background: 'white',
							}}
						/>
					)}
				/>
			</FormControl>
		</Box>
	);
}

export default PlacesAutocomplete;
