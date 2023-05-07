import { Edit } from '@mui/icons-material';
import {
	Box,
	Button,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { TextInput } from 'components/FormikMuiFields';
import { Field, Form, Formik } from 'formik';
import { useAppDispatch, useAppSelector } from 'hooks';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { errorAlert, successAlert } from 'store/alert';
import { setUser } from 'store/user';
import { handleError, updateUser } from 'utils/api-calls';
import { prettifyPhoneString } from 'utils/helpers';
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
	phone: Yup.string()
		.required('Phone Number is required')
		.matches(/^\(\d{3}\)\s\d{3}-\d{4}$/, 'Invalid Phone Number'),
});

const MyProfile: React.FC<{}> = () => {
	const user = useAppSelector((state) => state.user.value);
	const dispatch = useAppDispatch();
	const [editDetails, setEditDetails] = useState<boolean>(false);

	if (!user) return <Navigate to="/" />;

	return (
		<Box>
			<Formik
				initialValues={{
					firstName: user?.firstName,
					lastName: user?.lastName,
					phone: prettifyPhoneString(user?.phone ?? '').substring(3),
				}}
				validationSchema={schema}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						setSubmitting(true);
						if (
							user?.firstName === values.firstName &&
							user?.lastName === values.lastName &&
							user?.phone === values.phone.replace(/\D/g, '')
						)
							throw new Error('No values updated');
						const reqBody = {
							...values,
							phone: values.phone.replace(/\D/g, ''),
						};
						const res = await updateUser(user?._id, reqBody);
						if (!res.user) throw new Error();
						dispatch(setUser(res.user));
						dispatch(successAlert('Details updated successfully!'));
						setEditDetails(false);
					} catch (e: any) {
						let error = 'Unexpected error occurred';
						if (typeof handleError(e) === 'string') error = handleError(e);
						dispatch(errorAlert(error));
					} finally {
						setSubmitting(false);
					}
				}}
				enableReinitialize
			>
				{({
					values,
					setFieldValue,
					errors,
					handleBlur,
					touched,
					isSubmitting,
				}) => (
					<Form>
						<Stack gap={2}>
							<Button
								sx={{
									alignSelf: 'flex-end',
								}}
								endIcon={!editDetails && <Edit />}
								variant="outlined"
								onClick={() => {
									setEditDetails(!editDetails);
								}}
							>
								{editDetails ? 'Cancel' : 'Edit Details'}
							</Button>
							<Stack direction="row" gap={4} justifyContent="stretch">
								<Box sx={{ width: '100%' }}>
									<Typography>First Name:</Typography>
									{editDetails ? (
										<Field component={TextInput} name="firstName" required />
									) : (
										<Typography variant="h5" component="p">
											{user?.firstName}
										</Typography>
									)}
								</Box>
								<Box sx={{ width: '100%' }}>
									<Typography>Last Name:</Typography>
									{editDetails ? (
										<Field component={TextInput} name="lastName" required />
									) : (
										<Typography variant="h5" component="p">
											{user?.lastName}
										</Typography>
									)}
								</Box>
							</Stack>
							<Stack direction="row" gap={4} justifyContent="stretch">
								<Box sx={{ width: '100%' }}>
									<Typography>Email:</Typography>
									<Typography variant="h5" component="p">
										{user?.email}
									</Typography>
								</Box>
								<Box sx={{ width: '100%' }}>
									<Typography>Phone:</Typography>
									{editDetails ? (
										<TextField
											variant="outlined"
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
													if (number.length > 6)
														formattedNumber += `-${lastFour}`;
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
									) : (
										<Typography variant="h5" component="p">
											{prettifyPhoneString(user?.phone ?? '')}
										</Typography>
									)}
								</Box>
							</Stack>
							<Stack direction="row" gap={4} justifyContent="stretch">
								<Box sx={{ width: '100%' }}>
									<Typography>Role:</Typography>
									<Typography variant="h5" component="p">
										{user?.role}
									</Typography>
								</Box>
								<Box sx={{ width: '100%' }}>
									<Stack
										sx={{ height: '100%' }}
										justifyContent="flex-end"
										alignItems="flex-end"
									>
										{editDetails && (
											<Button
												size="large"
												type="submit"
												variant="contained"
												disabled={
													isSubmitting ||
													Object.keys(errors).length > 0 ||
													(user?.firstName === values.firstName &&
														user?.lastName === values.lastName &&
														user?.phone === values.phone.replace(/\D/g, ''))
												}
											>
												Update
											</Button>
										)}
									</Stack>
								</Box>
							</Stack>
						</Stack>
					</Form>
				)}
			</Formik>
		</Box>
	);
};

export default MyProfile;
