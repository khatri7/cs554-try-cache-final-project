import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import DatePickerInput from 'components/DatePicker';
import { Formik, Form, Field } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { errorAlert, successAlert } from 'store/alert';
import { setUser } from 'store/user';
import { createUser, handleError } from 'utils/api-calls';
import { isValidDateStr, isValidDob } from 'utils/helpers';
import { UserCreate } from 'utils/types';
import * as Yup from 'yup';

const schema = Yup.object().shape({
	firstName: Yup.string()
		.required('First name is required')
		.matches(/^[a-zA-Z]*$/, 'Invalid First name')
		.min(3, 'First name must be at least 3 characters')
		.max(40, 'First name cannot be greater than 40 characters'),
	lastName: Yup.string()
		.required('Last name is required')
		.matches(/^[a-zA-Z]*$/, 'Invalid Last name')
		.min(3, 'Last name must be at least 3 characters')
		.max(40, 'Last name cannot be greater than 40 characters'),
	dob: Yup.string().required('DOB is required'),
	phone: Yup.string()
		.required('Phone Number is required')
		.matches(/^\(\d{3}\)\s\d{3}-\d{4}$/, 'Invalid Phone Number'),
	email: Yup.string()
		.required('Email is required')
		.matches(
			// eslint-disable-next-line no-useless-escape
			/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
			'Invalid email'
		),
	password: Yup.string()
		.required('Password is required')
		.min(8, 'Password must be at least 8 characters'),
	role: Yup.string()
		.required('Role is required')
		.oneOf(['tenant', 'lessor'], 'Invalid role'),
});

function Signup() {
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const handleClickShowPassword = () => {
		setShowPassword(!showPassword);
	};
	const handleMouseDownPassword = (event: React.SyntheticEvent) => {
		event.preventDefault();
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
				<Formik
					initialValues={{
						firstName: '',
						lastName: '',
						email: '',
						phone: '',
						password: '',
						dob: null,
						role: '',
					}}
					validationSchema={schema}
					validate={(values) => {
						const errors: { [key: string]: string } = {};
						if (values.dob) {
							if (!isValidDateStr(values.dob)) errors.dob = 'Invalid DOB';
							else if (!isValidDob(values.dob))
								errors.dob =
									'Invalid DOB: Should be between 18-100 years in age';
						}
						return errors;
					}}
					onSubmit={async (values, { setSubmitting }) => {
						try {
							setSubmitting(true);
							const userObj: UserCreate = {
								...values,
								phone: values.phone.replace(/\D/g, ''),
							};
							const resp = await createUser(userObj);
							if (!resp.user) throw new Error();
							dispatch(setUser(resp.user));
							navigate('/');
							dispatch(successAlert('Account created successfully'));
						} catch (e) {
							let error = 'Unexpected error occurred';
							if (typeof handleError(e) === 'string') error = handleError(e);
							dispatch(errorAlert(error));
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{({
						values,
						errors,
						touched,
						setFieldValue,
						handleChange,
						handleBlur,
						isSubmitting,
					}) => (
						<Form>
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
								<Typography
									variant="h3"
									component="h1"
									sx={{ textTransform: 'uppercase' }}
								>
									Sign Up
								</Typography>
								<Stack
									direction="row"
									spacing={2}
									sx={{
										width: '100%',
									}}
								>
									<TextField
										variant="outlined"
										label="First Name"
										name="firstName"
										value={values.firstName}
										onChange={handleChange}
										onBlur={handleBlur}
										error={touched.firstName && Boolean(errors.firstName)}
										helperText={touched.firstName && errors.firstName}
										fullWidth
										required
									/>
									<TextField
										variant="outlined"
										label="Last Name"
										name="lastName"
										value={values.lastName}
										onChange={handleChange}
										onBlur={handleBlur}
										error={touched.lastName && Boolean(errors.lastName)}
										helperText={touched.lastName && errors.lastName}
										fullWidth
										required
									/>
								</Stack>
								<TextField
									variant="outlined"
									label="E-Mail"
									name="email"
									value={values.email}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.email && Boolean(errors.email)}
									helperText={touched.email && errors.email}
									fullWidth
									required
								/>
								<TextField
									variant="outlined"
									label="Phone"
									name="phone"
									value={values.phone}
									onChange={(e) => {
										let number = e.target.value;
										number = number.replace(/\D/g, '');
										number = number.replace(/[()-\s]/g, '');
										if (number.length > 10) return;
										const firstThree = number.substring(0, 3);
										const secondThree = number.substring(3, 6);
										const lastFour = number.substring(6);
										let formattedNumber = '';
										if (number.length > 3) {
											formattedNumber += `(${firstThree}) ${secondThree}`;
											if (number.length > 6) formattedNumber += `-${lastFour}`;
										} else formattedNumber = firstThree;
										setFieldValue('phone', formattedNumber);
									}}
									onBlur={handleBlur}
									error={touched.phone && Boolean(errors.phone)}
									helperText={touched.phone && errors.phone}
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">+1</InputAdornment>
										),
									}}
									required
								/>
								<TextField
									variant="outlined"
									label="Password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									value={values.password}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.password && Boolean(errors.password)}
									helperText={touched.password && errors.password}
									fullWidth
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													aria-label="toggle password visibility"
													onClick={handleClickShowPassword}
													onMouseDown={handleMouseDownPassword}
													edge="end"
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
									required
								/>
								<Field
									name="dob"
									component={DatePickerInput}
									label="Date of Birth"
									maxDate={moment().subtract(18, 'y')}
									required
								/>
								<TextField
									variant="outlined"
									select
									label="Role"
									name="role"
									value={values.role}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.role && Boolean(errors.role)}
									helperText={touched.role && errors.role}
									fullWidth
									required
								>
									<MenuItem value="tenant">Tenant</MenuItem>
									<MenuItem value="lessor">Lessor</MenuItem>
								</TextField>
								<Button
									variant="contained"
									type="submit"
									sx={{
										height: '3rem',
										width: '10rem',
									}}
									disabled={!!(isSubmitting || Object.keys(errors).length > 0)}
								>
									{isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
				<Typography>
					Already a user?{' '}
					<Button
						type="button"
						onClick={() => {
							navigate('/login');
						}}
					>
						Log In
					</Button>
				</Typography>
			</Box>
		</Box>
	);
}

export default Signup;
