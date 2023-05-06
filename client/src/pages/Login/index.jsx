import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
import {
	Button,
	TextField,
	Box,
	Typography,
	CircularProgress,
	InputAdornment,
	IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { handleError, login } from 'utils/api-calls';
import { useDispatch } from 'react-redux';
import { errorAlert } from 'store/alert';
import { useNavigate } from 'react-router-dom';
import { setUser } from 'store/user';

const schema = Yup.object().shape({
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
});

function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const handleClickShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const dispatch = useDispatch();

	const navigate = useNavigate();

	const handleMouseDownPassword = (event) => {
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
					validationSchema={schema}
					initialValues={{ email: '', password: '' }}
					onSubmit={async (values, { setSubmitting }) => {
						try {
							setSubmitting(true);
							const resp = await login(values);
							if (!resp.user) throw new Error();
							dispatch(setUser(resp.user));
							navigate('/');
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
								}}
							>
								<Typography
									variant="h3"
									component="h1"
									sx={{ mb: 2, textTransform: 'uppercase' }}
								>
									Login
								</Typography>
								<TextField
									variant="outlined"
									label="E-Mail"
									name="email"
									value={values.email}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.email && Boolean(errors.email)}
									helperText={touched.email && errors.email}
									sx={{
										minWidth: 500,
										mb: 2,
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
									sx={{
										minWidth: 500,
										mb: 2,
									}}
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
								<Button
									variant="contained"
									type="submit"
									sx={{
										height: '3rem',
										width: '10rem',
									}}
									disabled={
										!!(
											isSubmitting ||
											!values.email ||
											!values.password ||
											errors.email ||
											errors.password
										)
									}
								>
									{isSubmitting ? <CircularProgress size={24} /> : 'Login'}
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
				<Typography>
					New here?{' '}
					<Button
						type="button"
						onClick={() => {
							navigate('/signup');
						}}
					>
						Sign Up
					</Button>
				</Typography>
			</Box>
		</Box>
	);
}

export default Login;
