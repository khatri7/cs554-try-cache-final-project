import { Download } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	FormHelperText,
	Stack,
	Typography,
} from '@mui/material';
import { TextInput } from 'components/FormikMuiFields';
import { Field, Form, Formik } from 'formik';
import React, { useRef, useState } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDispatch } from 'react-redux';
import { errorAlert, successAlert } from 'store/alert';
import { approveApplication, handleError } from 'utils/api-calls';
import { prettifyPhoneString } from 'utils/helpers';
import { Application } from 'utils/types/application';

const FIVE_MB = 1024 * 1024 * 5;

interface LessorApplicationViewInterface {
	application: Application;
	handleDecline: () => void;
	disableDeclineBtn: boolean | undefined;
	onSuccessApprove: Function;
}

const LessorApplicationView: React.FC<LessorApplicationViewInterface> = ({
	application,
	handleDecline,
	disableDeclineBtn,
	onSuccessApprove,
}) => {
	const [showApproveForm, setShowApproveForm] = useState(false);
	const fileUploadRef = useRef<HTMLInputElement | null>(null);

	const dispatch = useDispatch();

	const handleFileUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		onSuccess: (document: File) => void
	) => {
		const document = e.target?.files && e.target.files[0];
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

	const initialValues: {
		text: string;
		terms: File | null;
	} = {
		text: '',
		terms: null,
	};

	return (
		<Box>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" component="p">
					Tenant Information:
				</Typography>
				{application.tenant && (
					<>
						<Typography>
							{application.tenant.firstName} {application.tenant.lastName}
						</Typography>
						<Typography>
							<a href={`mailto:${application.tenant.email}`}>
								{application.tenant.email}
							</a>
						</Typography>
						<Typography>
							{application.tenant.phone
								? prettifyPhoneString(application.tenant.phone)
								: ''}
						</Typography>
					</>
				)}
			</Box>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" component="p">
					Note from applicant:
				</Typography>
				<Typography>{application.notes?.REVIEW?.text || 'No Note'}</Typography>
			</Box>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" component="p">
					Document Attached:
				</Typography>
				{application.notes?.REVIEW?.document ? (
					<Button
						href={application.notes?.REVIEW?.document}
						variant="outlined"
						target="_blank"
						rel="noreferrer"
						endIcon={<Download />}
					>
						Download
					</Button>
				) : (
					<Typography>No document included with application</Typography>
				)}
			</Box>
			<Box sx={{ mt: 8, mb: 4 }}>
				{application.status === 'REVIEW' && !showApproveForm && (
					<Stack direction="row" gap={4}>
						<Button
							color="error"
							variant="outlined"
							size="large"
							onClick={handleDecline}
							disabled={disableDeclineBtn}
						>
							Decline
						</Button>
						<Button
							variant="contained"
							size="large"
							disabled={disableDeclineBtn || application.listing.occupied}
							onClick={() => {
								if (application.listing.occupied) {
									dispatch(errorAlert('The listing is off market!'));
								} else {
									setShowApproveForm(true);
								}
							}}
						>
							Approve
						</Button>
					</Stack>
				)}
				{showApproveForm && (
					<Formik
						initialValues={initialValues}
						onSubmit={async (values, { setSubmitting }) => {
							try {
								setSubmitting(true);
								const response = await approveApplication(
									application._id,
									values
								);
								if (!response.application) throw new Error();
								onSuccessApprove(response.application);
								setShowApproveForm(false);
								dispatch(successAlert('Application Approved!'));
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
								<Stack gap={2}>
									<Field
										name="text"
										component={TextInput}
										label="Notes"
										multiline
										minRows={10}
									/>
									<FormHelperText sx={{ mt: -2 }}>
										* Use this to include any notes you want to mention to the
										tenant with approving the application and to list any
										additional documents you would like them to upload (max 5)
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
												if (fileUploadRef.current)
													fileUploadRef.current.click();
											}}
										>
											Upload Terms and Conditions
										</Button>
										<Typography fontStyle="italic">
											{values.terms
												? `Selected File: ${values.terms.name}`
												: 'No File Selected'}
										</Typography>
									</Stack>
									<input
										ref={fileUploadRef}
										type="file"
										name="document"
										hidden
										accept="application/pdf"
										onChange={(e) => {
											handleFileUpload(e, (value) => {
												setFieldValue('terms', value);
											});
										}}
									/>
									<Stack
										direction="row"
										gap={4}
										sx={{ alignSelf: 'flex-end', mt: 2 }}
									>
										<Button
											variant="outlined"
											onClick={() => {
												setShowApproveForm(false);
											}}
										>
											Cancel
										</Button>
										<Button
											variant="contained"
											type="submit"
											disabled={isSubmitting}
										>
											Approve Application
										</Button>
									</Stack>
								</Stack>
							</Form>
						)}
					</Formik>
				)}
			</Box>
			{application.status === 'COMPLETED' && (
				<>
					<Divider sx={{ my: 4 }} />
					<Box sx={{ mb: 4 }}>
						<Typography variant="h5" component="p" gutterBottom>
							Completed Application
						</Typography>
						<Typography variant="h6" component="p" sx={{ mt: 2 }} gutterBottom>
							Note from applicant
						</Typography>
						<Typography>{application.notes.COMPLETED?.text}</Typography>
						<Typography variant="h6" component="p" sx={{ mt: 2 }} gutterBottom>
							Additional Documents
						</Typography>
						{application.notes.COMPLETED?.documents?.length === 0 ? (
							<Typography>No Documents</Typography>
						) : (
							<Stack gap={2} alignItems="flex-start">
								{application.notes.COMPLETED?.documents?.map((doc) => (
									<Button
										href={doc}
										key={doc}
										variant="outlined"
										target="_blank"
										rel="noreferrer"
										endIcon={<Download />}
									>
										Download
									</Button>
								))}
							</Stack>
						)}
					</Box>
				</>
			)}
		</Box>
	);
};

export default LessorApplicationView;
