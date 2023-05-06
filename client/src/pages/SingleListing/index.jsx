import {
	Box,
	Button,
	FormControl,
	FormControlLabel,
	FormLabel,
	Modal,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { errorAlert } from 'store/alert';
import { DELETE, PATCH, handleError } from 'utils/api-calls';
import { isValidNum, isValidStr } from 'utils/helpers';
// eslint-disable-next-line import/no-extraneous-dependencies
import toast, { Toaster } from 'react-hot-toast';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

function SingleListing() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [open, setOpen] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleDeleteModalOpen = () => setDeleteModal(true);
	const { id } = useParams();
	const [formValues, setFormValues] = useState({
		description: '',
		rent: '',
		deposit: '',
		availabilityDate: null,
		occupied: '',
	});

	const [isDisabled, setIsDisabled] = useState(false);

	const handleSubmit = async (event) => {
		try {
			setIsDisabled(true);
			event.preventDefault();
			const { description, rent, deposit } = formValues;
			isValidStr(description);
			isValidNum(rent, 'min', 100);
			isValidNum(deposit, 'min', 0);
			const res = await PATCH(`/listings/${id}`, formValues);
			if (res && res.listing._id) {
				navigate(`/listings/${res.listing._id}`);
			}
			setOpen(false);
			toast.success('Your Listing is successfully updated!');
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		}
	};

	const handleChange = (event) => {
		const { name, value, type } = event.target;
		setIsDisabled(false);
		if (name === 'occupied') {
			setFormValues({
				...formValues,
				occupied: value === 'true',
			});
		} else {
			setFormValues({
				...formValues,
				[name]: type === 'number' ? parseInt(value, 10) : value,
			});
		}
	};

	const handleDelete = async () => {
		try {
			setDeleteModal(true);
			const res = await DELETE(`/listings/${id}`);
			if (res && res.listing.deleted === true) {
				toast.success('Listing Deleted Successfully!');
				setTimeout(() => {
					navigate('/');
				}, 1000);
			}
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		}
	};

	return (
		<div>
			<Toaster />
			<Button
				variant="contained"
				onClick={() => {
					navigate(`/listings/${id}/application`);
				}}
			>
				Apply
			</Button>
			<Button variant="contained" component="label" onClick={handleOpen}>
				Update Listing
			</Button>
			<Button
				variant="contained"
				component="label"
				onClick={handleDeleteModalOpen}
			>
				Delete Listing
			</Button>
			<Modal
				open={open}
				onClose={handleSubmit}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Update Listing
					</Typography>
					<TextField
						name="description"
						label="Description"
						value={formValues.description}
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
					<FormLabel component="legend">Occupied</FormLabel>
					<RadioGroup
						aria-label="occupied"
						name="occupied"
						value={formValues.occupied.toString()}
						onChange={handleChange}
					>
						<FormControlLabel
							value={true.toString()}
							control={<Radio />}
							label="Occupied"
						/>
						<FormControlLabel
							value={false.toString()}
							control={<Radio />}
							label="Not Occupied"
						/>
					</RadioGroup>
					<Button
						variant="contained"
						color="primary"
						type="submit"
						disabled={isDisabled}
						onClick={handleSubmit}
					>
						Submit
					</Button>
				</Box>
			</Modal>
			<Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Confirm Delete
					</Typography>
					<Typography id="modal-modal-description" sx={{ mt: 2 }}>
						Do you really want to delete this listing?
					</Typography>
					<Button variant="contained" onClick={handleDelete}>
						Yes
					</Button>
					<Button variant="contained" onClick={() => setDeleteModal(false)}>
						No
					</Button>
				</Box>
			</Modal>
		</div>
	);
}

export default SingleListing;
