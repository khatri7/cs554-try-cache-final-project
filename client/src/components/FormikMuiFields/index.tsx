import {
	FormControl,
	MenuItem,
	TextField,
	Select as MuiSelect,
	FormHelperText,
	InputLabel,
	TextareaAutosize,
	FormLabel,
	TextFieldProps,
	SelectProps,
	TextareaAutosizeProps,
} from '@mui/material';
import { FieldProps } from 'formik';
import React from 'react';

export const TextInput: React.FC<FieldProps & TextFieldProps> = ({
	field: { name, value, onChange, onBlur },
	form: { errors, touched },
	label,
	required = false,
	...rest
}) => {
	return (
		<FormControl fullWidth>
			<TextField
				variant="outlined"
				label={label}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				error={touched[name] && Boolean(errors[name])}
				helperText={touched[name] && (errors[name] as string)}
				required={required}
				{...rest}
			/>
		</FormControl>
	);
};

export const Select: React.FC<
	FieldProps &
		SelectProps & {
			options: Array<{
				value: any;
				label: string;
			}>;
		}
> = ({
	field: { name, value, onChange, onBlur },
	form: { errors, touched },
	label,
	required = false,
	options,
	...rest
}) => {
	return (
		<FormControl fullWidth required={required}>
			<InputLabel>{label}</InputLabel>
			<MuiSelect
				label={label}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				{...rest}
			>
				{options.map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</MuiSelect>
			<FormHelperText error={touched[name] && Boolean(errors[name])}>
				{touched[name] && (errors[name] as string)}
			</FormHelperText>
		</FormControl>
	);
};

export const TextArea: React.FC<
	FieldProps &
		TextareaAutosizeProps & {
			label: string;
		}
> = ({
	field: { name, value, onChange, onBlur },
	form,
	label,
	required = false,
	...rest
}) => {
	return (
		<FormControl fullWidth>
			<FormLabel>{label}</FormLabel>
			<TextareaAutosize
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				minRows={10}
				// error={touched[name] && Boolean(errors[name])}
				// helperText={touched[name] && errors[name]}
				required={required}
				{...rest}
			/>
		</FormControl>
	);
};
