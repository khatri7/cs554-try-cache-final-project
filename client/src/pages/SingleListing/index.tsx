import {
	Box,
	Button,
	Chip,
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	Modal,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorAlert, successAlert, warningAlert } from 'store/alert';
import { DELETE, GET, PATCH, handleError } from 'utils/api-calls';
import { isValidNum } from 'utils/helpers';
import toast, { Toaster } from 'react-hot-toast';
import Carousel from 'react-material-ui-carousel';
import NoImage from 'components/ListingCard/no-image.jpeg';
import { useAppDispatch, useAppSelector } from 'hooks';
import { formatter } from 'components/ListingCard';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PetsIcon from '@mui/icons-material/Pets';
import { Delete, Edit } from '@mui/icons-material';
import { GoogleMap, MarkerF as Marker } from '@react-google-maps/api';
import UploadListingMedia from 'components/UploadListingMedia';
import { Listing } from 'utils/types/listing';

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

const ListingToBeShown: React.FC<{
	listing: Listing;
	isOwner: boolean;
	setCurrListing: Dispatch<SetStateAction<{ listing: Listing } | null>>;
}> = ({ listing, isOwner, setCurrListing }) => {
	const {
		apt,
		bedrooms,
		bathrooms,
		deposit,
		description,
		location,
		occupied,
		rent,
		photos,
		parking,
		petPolicy,
		squareFoot,
	} = listing;
	const listingPhotos = photos?.filter((photo) => photo !== null) as string[];
	const laundry = useMemo(() => {
		if (listing.laundry === 'inunit') return 'In-Unit';
		if (listing.laundry === 'shared') return 'Shared';
		return 'Not Available';
	}, [listing.laundry]);
	const [showUpdateMediaForm, setShowUpdateMediaForm] = useState(false);
	return (
		<Box>
			<Grid container spacing={4}>
				<Grid item xs={12} sm={6}>
					{showUpdateMediaForm ? (
						<UploadListingMedia
							listingPhotos={photos}
							listingId={listing._id}
							handleUpdate={(updatedListing) => {
								setCurrListing({ listing: updatedListing });
							}}
							close={() => {
								setShowUpdateMediaForm(false);
							}}
						/>
					) : (
						<>
							<Carousel height={400} animation="slide">
								{listingPhotos.length > 0 ? (
									listingPhotos.map((photo) => (
										<img
											src={photo}
											alt={location.name}
											style={{ height: '100%', objectFit: 'contain' }}
											key={photo}
										/>
									))
								) : (
									<img
										src={NoImage}
										alt={location.name}
										style={{ width: '100%', objectFit: 'contain' }}
									/>
								)}
							</Carousel>
							{isOwner && (
								<Stack alignItems="center">
									<Button
										type="button"
										size="small"
										onClick={() => {
											setShowUpdateMediaForm(true);
										}}
									>
										Update Images
									</Button>
								</Stack>
							)}
						</>
					)}
				</Grid>
				<Grid item xs={12} sm={6}>
					<Typography gutterBottom variant="h4" component="p" sx={{ mt: 1 }}>
						{formatter.format(rent)}/mo
					</Typography>
					{apt && (
						<Typography variant="h5" component="p">
							Apt {apt}
						</Typography>
					)}
					<Typography variant="h5" component="p" gutterBottom>
						{location?.streetAddress}
					</Typography>
					<Typography gutterBottom fontSize="1.2rem">
						<span style={{ fontWeight: 'bold' }}>{bedrooms}</span> bd |{' '}
						<span style={{ fontWeight: 'bold' }}>{bathrooms}</span> ba |{' '}
						<span style={{ fontWeight: 'bold' }}>{squareFoot || '--'}</span>{' '}
						sqft
					</Typography>
					<Typography gutterBottom fontSize="1.2rem" sx={{ mb: 4 }}>
						<span style={{ fontWeight: 'bold' }}>Deposit: </span>{' '}
						{deposit ? formatter.format(deposit) : 'N/A'}
					</Typography>
					<Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
						<LocalLaundryServiceIcon />
						<Typography fontSize="1.1rem">
							<span style={{ fontWeight: 'bold' }}>Laundry:</span> {laundry}
						</Typography>
					</Stack>
					<Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
						<LocalParkingIcon />
						<Typography fontSize="1.1rem">
							<span style={{ fontWeight: 'bold' }}>Parking:</span>{' '}
							{parking === 'available' ? 'Available' : 'Not Available'}
						</Typography>
					</Stack>
					<Stack direction="row" gap={1} alignItems="center">
						<PetsIcon />
						<Typography fontSize="1.1rem">
							<span style={{ fontWeight: 'bold' }}>Pet Policy:</span>{' '}
							{petPolicy === 'allowed' ? 'Allowed' : 'Not Allowed'}
						</Typography>
					</Stack>
					{occupied && <Chip sx={{ mt: 4 }} label="OFF MARKET" />}
				</Grid>
			</Grid>
			<Typography
				gutterBottom
				sx={{ mt: 2 }}
				variant="h4"
				component="p"
				fontWeight="light"
			>
				Description
			</Typography>
			<Typography fontSize="1.1rem">
				{description.trim() ? description.trim() : 'No Description'}
			</Typography>
			<Box sx={{ mt: 4 }}>
				<GoogleMap
					mapContainerStyle={{ height: '200px' }}
					zoom={12}
					center={{
						lat: location.lat,
						lng: location.lng,
					}}
				>
					<Marker
						position={{
							lat: location.lat,
							lng: location.lng,
						}}
					/>
				</GoogleMap>
			</Box>
		</Box>
	);
};

const SingleListing: React.FC<{}> = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [open, setOpen] = useState<boolean>(false);
	const [deleteModal, setDeleteModal] = useState<boolean>(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const handleDeleteModalOpen = () => setDeleteModal(true);
	const { id } = useParams();
	const [currListing, setCurrListing] = useState<null | { listing: Listing }>(
		null
	);
	useEffect(() => {
		async function getListing() {
			try {
				const listing = await GET<{ listing: Listing }>(`/listings/${id}`);
				setCurrListing(listing);
			} catch (e: any) {
				navigate('/404');
			}
		}

		getListing();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [formValues, setFormValues] = useState<{
		description: string;
		rent: string | number;
		deposit: string | number;
		availabilityDate: string | null;
		occupied: string | boolean;
	}>({
		description: '',
		rent: '',
		deposit: '',
		availabilityDate: null,
		occupied: '',
	});

	useEffect(() => {
		if (currListing?.listing) {
			const { rent, description, deposit, occupied, availabilityDate } =
				currListing.listing;
			setFormValues({
				rent,
				description,
				deposit,
				occupied,
				availabilityDate,
			});
		}
	}, [currListing]);

	const [isDisabled, setIsDisabled] = useState(false);
	const user = useAppSelector((state) => state.user.value);

	const handleSubmit = async (event: React.SyntheticEvent) => {
		try {
			setIsDisabled(true);
			event.preventDefault();
			const { description, rent, deposit, occupied, availabilityDate } =
				formValues;
			if (!isValidNum(Number(rent), 'min', 100))
				throw new Error('Invalid Rent, should at least 100');
			if (!isValidNum(Number(deposit), 'min', 0))
				throw new Error('Invalid Deposit');
			if (
				rent === currListing?.listing.rent &&
				deposit === currListing?.listing.deposit &&
				description.trim() === currListing?.listing.description &&
				occupied === currListing?.listing.occupied &&
				availabilityDate === currListing?.listing.availabilityDate
			) {
				dispatch(warningAlert('No fields updated'));
				return;
			}
			const res = await PATCH(`/listings/${id}`, formValues);
			if (!res.listing) throw new Error();
			setCurrListing({ listing: res.listing });
			setOpen(false);
			dispatch(successAlert('Your Listing is successfully updated!'));
		} catch (e) {
			let error = 'Unexpected error occurred';
			if (typeof handleError(e) === 'string') error = handleError(e);
			dispatch(errorAlert(error));
		} finally {
			setIsDisabled(false);
		}
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		let { type } = event.target;
		setIsDisabled(false);
		if (value === '') type = 'change';
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
			if (!res?.listing?.deleted) throw new Error();
			if (res && res.listing?.deleted === true) {
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

	// const handleBackdropClick = (event) => {
	// 	event.stopPropagation();
	// };

	const isOwner = Boolean(
		user && currListing?.listing && currListing.listing.listedBy === user._id
	);

	return (
		<div>
			<Toaster />
			{isOwner && (
				<Stack direction="row" gap={4} sx={{ mb: 2 }} justifyContent="flex-end">
					<Button variant="outlined" startIcon={<Edit />} onClick={handleOpen}>
						Update Listing
					</Button>
					<Button
						variant="outlined"
						color="error"
						startIcon={<Delete />}
						onClick={handleDeleteModalOpen}
					>
						Delete Listing
					</Button>
				</Stack>
			)}

			<Modal
				open={open}
				onClose={() => {
					setOpen(false);
				}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				// slotProps={{
				// 	backdrop: {
				// 		onClick: handleBackdropClick,
				// 	},
				// }}
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Update Listing
					</Typography>
					<TextField
						fullWidth
						name="description"
						label="Description"
						value={formValues.description}
						onChange={handleChange}
						multiline
						minRows={4}
						sx={{ mb: 2 }}
					/>
					<TextField
						type="number"
						name="rent"
						label="Rent"
						value={formValues.rent}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					/>

					<TextField
						type="number"
						name="deposit"
						label="Deposit"
						value={formValues.deposit}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<LocalizationProvider dateAdapter={AdapterMoment}>
							<DatePicker
								label="Availability Date"
								value={
									formValues.availabilityDate
										? moment(formValues.availabilityDate)
										: null
								}
								format="MM-DD-YYYY"
								minDate={
									formValues.availabilityDate
										? moment(formValues.availabilityDate)
										: moment()
								}
								onChange={(newValue) => {
									setIsDisabled(false);
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
						sx={{ mb: 2 }}
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
					{/* <input type="file" name="image" onChange={handleChange} /> */}
					<Stack direction="row" gap={2} justifyContent="flex-end">
						<Button
							variant="outlined"
							color="primary"
							type="submit"
							onClick={handleClose}
						>
							Close
						</Button>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							disabled={isDisabled}
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</Stack>
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
					<Stack
						direction="row"
						gap={2}
						sx={{ mt: 2 }}
						justifyContent="flex-end"
					>
						<Button variant="outlined" onClick={() => setDeleteModal(false)}>
							No
						</Button>
						<Button variant="contained" onClick={handleDelete} color="error">
							Yes
						</Button>
					</Stack>
				</Box>
			</Modal>
			<Box>
				{currListing && currListing.listing && (
					<ListingToBeShown
						listing={currListing.listing}
						isOwner={isOwner}
						setCurrListing={setCurrListing}
					/>
				)}
			</Box>
			{user?.role === 'tenant' && currListing?.listing?.occupied === false && (
				<Button
					variant="contained"
					sx={{ mt: 4 }}
					size="large"
					onClick={() => {
						navigate(`/listings/${id}/application`);
					}}
				>
					Apply
				</Button>
			)}
		</div>
	);
};

export default SingleListing;
