import {
	Box,
	Button,
	FormHelperText,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { TextInput } from 'components/FormikMuiFields';
import { Field, Form, Formik } from 'formik';
import React, { useRef } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDispatch, useSelector } from 'react-redux';
import { errorAlert, successAlert } from 'store/alert';
import { useNavigate, useParams } from 'react-router-dom';
import { createApplication, handleError } from 'utils/api-calls';

const FIVE_MB = 1024 * 1024 * 5;

function Application() {
	const user = useSelector((state) => state.user);
	const fileUploadRef = useRef();
	const navigate = useNavigate();
	const { id } = useParams();

	const dispatch = useDispatch();

	const handleFileUpload = (e, onSuccess) => {
		const document = e.target.files[0];
		if (document) {
			if (document.type !== 'application/pdf') {
				e.target.value = '';
				dispatch(errorAlert('Document needs to be of type pdf'));
			} else if (document.size > FIVE_MB) {
				e.target.value = '';
				dispatch(errorAlert('File size cannot be greater than 5MB'));
			} else {
				onSuccess(document);
			}
		}
	};

	return (
		<Box>
			<Formik
				initialValues={{
					firstName: user?.firstName || '',
					lastName: user?.lastName || '',
					email: user?.email || '',
					phone: user?.phone || '',
					notes: '',
					document: null,
				}}
				enableReinitialize
				onSubmit={async ({ notes, document }, { setSubmitting }) => {
					try {
						setSubmitting(true);
						const res = await createApplication({
							notes,
							document,
							listingId: id,
						});
						if (!res.application) throw new Error();
						navigate(`/applications/${res.application._id}`);
						dispatch(successAlert('Application submitted successfully'));
					} catch (e) {
						let error = 'Unexpected error occurred';
						if (typeof handleError(e) === 'string') error = handleError(e);
						dispatch(errorAlert(error));
					} finally {
						setSubmitting(false);
					}
				}}
			>
				{({ values, setFieldValue, isSubmitting }) => (
					<Form>
						<Stack gap={3}>
							<Stack direction="row" gap={2}>
								<Field
									name="firstName"
									component={TextInput}
									label="First Name"
									InputProps={{
										readOnly: true,
									}}
								/>
								<Field
									name="lastName"
									component={TextInput}
									label="First Name"
									InputProps={{
										readOnly: true,
									}}
								/>
							</Stack>
							<Stack direction="row" gap={2}>
								<Field
									name="email"
									component={TextInput}
									label="E-mail"
									InputProps={{
										readOnly: true,
									}}
								/>
								<Field
									name="phone"
									component={TextInput}
									label="Phone"
									InputProps={{
										readOnly: true,
										startAdornment: (
											<InputAdornment position="start">+1</InputAdornment>
										),
									}}
								/>
							</Stack>
							<Field
								name="notes"
								component={TextField}
								label="Notes"
								multiline
								minRows={10}
							/>
							<FormHelperText sx={{ mt: -2 }}>
								* Include some details about your application here that will
								help your application. Such as number of tenants, your
								occupation, reviews, etc
							</FormHelperText>
							<Stack direction="row" gap={2} alignItems="center">
								<Button
									variant="outlined"
									size="large"
									startIcon={<UploadFileIcon />}
									sx={{
										alignSelf: 'flex-start',
									}}
									onClick={() => {
										if (fileUploadRef.current) fileUploadRef.current.click();
									}}
								>
									Upload
								</Button>
								<Typography fontStyle="italic">
									{values.document
										? `Selected File: ${values.document.name}`
										: 'No File Selected'}
								</Typography>
							</Stack>
							<FormHelperText sx={{ mt: -2 }}>
								* Use this to include a single merged document of any documents
								you would like to attach with your application to make it
								stronger and/or for any documents asked by the lessor in
								description.
							</FormHelperText>
							<input
								ref={fileUploadRef}
								type="file"
								name="document"
								hidden
								accept="application/pdf"
								onChange={(e) => {
									handleFileUpload(e, (value) => {
										setFieldValue('document', value);
									});
								}}
							/>
							<Button
								variant="contained"
								type="submit"
								sx={{
									mt: 4,
									alignSelf: 'flex-end',
								}}
								disabled={isSubmitting}
							>
								Submit Application
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Box>
	);
}

export default Application;
