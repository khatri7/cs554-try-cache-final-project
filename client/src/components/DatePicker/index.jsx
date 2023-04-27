import React from 'react';
import { FormControl } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

function DatePickerInput({
	field,
	form: { setFieldValue, errors, touched, handleBlur },
	label,
	disabled = false,
	minDate,
	maxDate,
	required,
}) {
	return (
		<FormControl fullWidth>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<DatePicker
					label={label}
					disabled={disabled}
					name={field.name}
					value={field.value ? moment(field.value) : null}
					format="MM-DD-YYYY"
					minDate={minDate || moment().subtract(100, 'y')}
					maxDate={maxDate || moment()}
					onChange={(newValue) => {
						setFieldValue(
							field.name,
							newValue ? newValue.format('MM-DD-YYYY') : null
						);
					}}
					slotProps={{
						textField: {
							name: field.name,
							error: touched[field.name] && Boolean(errors[field.name]),
							helperText: touched[field.name] && errors[field.name],
							required,
							onBlur: handleBlur,
						},
					}}
				/>
			</LocalizationProvider>
		</FormControl>
	);
}

export default DatePickerInput;
