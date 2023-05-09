import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	FormHelperText,
	FormLabel,
	IconButton,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import useQuery from 'hooks/useQuery';
import { chipColor } from 'pages/MyApplications';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
	completeApplication,
	declineApplication,
	handleError,
	makePayment,
} from 'utils/api-calls';
import { errorAlert, successAlert } from 'store/alert';
import {
	Add,
	Download,
	OpenInNew,
	RemoveCircleOutline,
} from '@mui/icons-material';
import { Field, Form, Formik } from 'formik';
import UploadFileBtn from 'components/UploadFileBtn';
import { TextInput } from 'components/FormikMuiFields';
import LessorApplicationView from './LessorApplicationView';
import Document from './Document.svg';

const FIVE_MB = 1024 * 1024 * 5;

function SingleApplication() {
	const { id } = useParams();
	const { loading, data, error } = useQuery(`/applications/${id}`);
	const [disableDeclineBtn, setDisableDeclineBtn] = useState(false);
	const [application, setApplication] = useState(null);
	const [initiatingPayment, setInitiatingPayment] = useState(false);
	const role = useSelector((state) => state.user.value?.role);
	const dispatch = useDispatch();

	useEffect(() => {
		if (data?.application) setApplication(data.application);
	}, [data]);

	if (loading) return <Typography>Loading...</Typography>;

	if (error || !application)
		return <Typography>{error || 'Error loading application'}</Typography>;

	const handleDecline = async () => {
		try {
			setDisableDeclineBtn(true);
			const result = await declineApplication(id);
			if (!result.application) throw new Error();
			setApplication(result.application);
			dispatch(successAlert('Application Declined!'));
		} catch (e) {
			let errorStr = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') errorStr = handleError(e);
			dispatch(errorAlert(errorStr));
		} finally {
			setDisableDeclineBtn(false);
		}
	};

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

	const onSuccessApprove = (updatedApplication) => {
		setApplication(updatedApplication);
	};

	const handlePayment = async () => {
		try {
			setInitiatingPayment(true);
			const res = await makePayment(application._id);
			if (!res.paymentUrl) throw new Error();
			window.location.href = res.paymentUrl;
		} catch (e) {
			let errorStr = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') errorStr = handleError(e);
			dispatch(errorAlert(errorStr));
			setInitiatingPayment(false);
		}
	};

	return (
		<>
			<Typography
				variant="h6"
				component="p"
				textTransform="uppercase"
				fontWeight="lighter"
			>
				Application for
			</Typography>
			<Typography variant="h5" component="p" gutterBottom>
				{application.listing.streetAddress}
				{application.listing.apt ? `, Apt ${application.listing.apt}` : ''}
			</Typography>
			<Box sx={{ mb: 4 }}>
				<Chip
					label={application.status}
					color={chipColor[application.status] || 'primary'}
					variant={
						application.status === 'COMPLETED' ? 'contained' : 'outlined'
					}
				/>
				{role === 'tenant' && application.status === 'REVIEW' && (
					<FormHelperText>
						Your application has been submitted to the Lessor of this property
						and is under review
					</FormHelperText>
				)}
				{role === 'tenant' && application.status === 'APPROVED' && (
					<FormHelperText>
						Your application has been approved. Find T&C below if included and
						any other comments left by the lessor.
					</FormHelperText>
				)}
				{role === 'tenant' && application.status === 'PAYMENT_PENDING' && (
					<FormHelperText>
						Your completed application will be sent to the lessor only once you
						complete the payment
					</FormHelperText>
				)}
			</Box>
			{role === 'lessor' && (
				<LessorApplicationView
					application={application}
					handleDecline={handleDecline}
					disableDeclineBtn={disableDeclineBtn}
					onSuccessApprove={onSuccessApprove}
				/>
			)}
			{role === 'tenant' && application.status === 'APPROVED' && (
				<>
					<Box sx={{ mb: 4 }}>
						<Typography variant="h6" fontWeight="normal">
							Comment from Lessor:
						</Typography>
						<Typography
							fontStyle={
								!data.application.notes?.APPROVED?.text ? 'italic' : 'normal'
							}
						>
							{data.application.notes?.APPROVED?.text || 'No Comment'}
						</Typography>
						{data.application.terms && (
							<>
								<Typography variant="h6" fontWeight="normal" sx={{ mt: 2 }}>
									Terms and Conditions:
								</Typography>
								<Button
									href={data.application.terms}
									variant="outlined"
									target="_blank"
									rel="noreferrer"
									endIcon={<Download />}
									sx={{ mb: 2 }}
								>
									Download
								</Button>
							</>
						)}
					</Box>
					<Divider />
					<Box sx={{ my: 4 }}>
						<Typography variant="h5" component="p" gutterBottom>
							Complete Application
						</Typography>
						<Formik
							initialValues={{
								text: '',
								documents: [],
							}}
							onSubmit={async (values, { setSubmitting }) => {
								try {
									setSubmitting(true);
									const reqObj = {
										...values,
										documents: values.documents.filter((doc) => doc !== null),
									};
									const res = await completeApplication(
										application._id,
										reqObj
									);
									if (res.paymentUrl) window.location.href = res.paymentUrl;
								} catch (e) {
									let errorStr = 'Unexpected error occurred';
									if (typeof handleError(e) === 'string')
										errorStr = handleError(e);
									dispatch(errorAlert(errorStr));
								} finally {
									setSubmitting(false);
								}
							}}
						>
							{({ values, setFieldValue, isSubmitting }) => (
								<Form>
									<Stack alignItems="flex-start" gap={4}>
										<Field
											name="text"
											component={TextInput}
											label="Notes"
											multiline
											minRows={10}
										/>
										<FormLabel>Documents</FormLabel>
										<FormHelperText sx={{ mt: -4, mb: -2 }}>
											Use this section to upload any documents that the lessor
											may have requested (max 5)
										</FormHelperText>
										{values.documents.map((document, index) => (
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												// eslint-disable-next-line react/no-array-index-key
												key={index}
												gap={2}
											>
												<Tooltip title="Remove">
													<IconButton
														onClick={() => {
															const currValues = [...values.documents];
															currValues.splice(index, 1);
															setFieldValue('documents', currValues);
														}}
														color="error"
													>
														<RemoveCircleOutline />
													</IconButton>
												</Tooltip>
												<UploadFileBtn
													value={document}
													onChange={(e) => {
														handleFileUpload(e, (value) => {
															setFieldValue(`documents[${index}]`, value);
														});
													}}
												/>
											</Stack>
										))}
										{values.documents.length < 5 && (
											<Button
												variant="outlined"
												size="small"
												startIcon={<Add />}
												onClick={() => {
													setFieldValue('documents', [
														...values.documents,
														null,
													]);
												}}
											>
												Add Document
											</Button>
										)}
										{/* <FormLabel sx={{ mb: -2 }}>Signed Lease</FormLabel>
										<UploadFileBtn
											value={values.lease}
											label="Upload Lease"
											onChange={(e) => {
												handleFileUpload(e, (value) => {
													setFieldValue('lease', value);
												});
											}}
										/>
										<FormHelperText sx={{ mt: -4 }}>*required</FormHelperText> */}
										<Button
											variant="contained"
											sx={{ alignSelf: 'flex-end' }}
											type="submit"
											disabled={isSubmitting}
										>
											Complete Application and Make Payment
										</Button>
										<FormHelperText sx={{ mt: -4, alignSelf: 'flex-end' }}>
											Your completed application will be sent to the lessor only
											once you complete the payment
										</FormHelperText>
									</Stack>
								</Form>
							)}
						</Formik>
					</Box>
				</>
			)}
			{role === 'tenant' && application.status === 'PAYMENT_PENDING' && (
				<>
					<Box sx={{ mb: 4 }}>
						<Typography variant="h6" fontWeight="normal">
							Comment from Lessor:
						</Typography>
						<Typography
							fontStyle={
								!data.application.notes?.APPROVED?.text ? 'italic' : 'normal'
							}
						>
							{data.application.notes?.APPROVED?.text || 'No Comment'}
						</Typography>
						{data.application.terms && (
							<>
								<Typography variant="h6" fontWeight="normal" sx={{ mt: 2 }}>
									Terms and Conditions:
								</Typography>
								<Button
									href={data.application.terms}
									variant="outlined"
									target="_blank"
									rel="noreferrer"
									endIcon={<Download />}
									sx={{ mb: 2 }}
								>
									Download
								</Button>
							</>
						)}
					</Box>
					<Divider />
					<Box sx={{ my: 4 }}>
						<Button
							size="large"
							variant="contained"
							onClick={handlePayment}
							disabled={initiatingPayment}
						>
							Complete Payment
						</Button>
					</Box>
				</>
			)}
			{application.status === 'COMPLETED' && application.terms && (
				<Box>
					<Card sx={{ width: 200 }} raised>
						<Box sx={{ mb: 0.5, pt: 2 }}>
							<img
								src={Document}
								alt="Terms And Conditions"
								style={{
									width: '100%',
								}}
							/>
						</Box>
						<CardContent>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
							>
								<Typography variant="h6" component="p">
									Terms and Conditions
								</Typography>
								<Tooltip title="View">
									<IconButton
										onClick={() => {
											window.open(application.terms, {
												target: '__blank',
											});
										}}
									>
										<OpenInNew />
									</IconButton>
								</Tooltip>
							</Stack>
						</CardContent>
					</Card>
				</Box>
			)}
		</>
	);
}

export default SingleApplication;
