import React, { useRef, useCallback, useState } from 'react';
import {
	Box,
	Button,
	CircularProgress,
	Grid,
	IconButton,
	Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useDispatch } from 'react-redux';
import { errorAlert, successAlert } from 'store/alert';
import {
	handleError,
	uploadListingImage,
	deleteListingImage,
} from 'utils/api-calls';
import { Listing } from 'utils/types/listing';

const FIVE_MB = 1024 * 1024 * 5;

const UploadImageBtn: React.FC<{
	position: number;
	listingId: string;
	handleUpdate: (listing: Listing) => void;
}> = ({ position, listingId, handleUpdate }) => {
	const [submitting, setSubmitting] = useState(false);
	const mediaBtnRef = useRef<HTMLInputElement | null>(null);
	const dispatch = useDispatch();
	const uploadImage = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			setSubmitting(true);
			const mediaFile = e.target?.files && e.target.files[0];
			if (mediaFile) {
				if (mediaFile.type !== 'image/jpeg' && mediaFile.type !== 'image/png') {
					e.target.value = '';
					dispatch(errorAlert('Image needs to be of type jpeg/png'));
				} else if (mediaFile.size > FIVE_MB) {
					e.target.value = '';
					return dispatch(errorAlert('File size cannot be greater than 5MB'));
				} else {
					try {
						const res = await uploadListingImage(listingId, {
							image: mediaFile,
							position,
						});
						if (!res.listing) throw new Error();
						handleUpdate(res.listing);
						dispatch(successAlert('Image uploaded successfully'));
					} catch (err) {
						let error = 'Unexpected error occurred';
						if (typeof handleError(err) === 'string') error = handleError(err);
						dispatch(errorAlert(error));
					}
				}
			}
			e.target.value = '';
			setSubmitting(false);
			return true;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
	return (
		<>
			<Button
				sx={{
					border: (theme) => `2px dashed ${theme.palette.primary.main}`,
					width: '100%',
					height: '150px',
				}}
				onClick={() => {
					if (mediaBtnRef.current) mediaBtnRef.current.click();
				}}
			>
				{submitting ? (
					<CircularProgress size={16} />
				) : (
					<AddIcon color="primary" />
				)}
			</Button>
			<input
				ref={mediaBtnRef}
				hidden
				onChange={uploadImage}
				accept="image/jpeg, image/png"
				type="file"
			/>
		</>
	);
};

const UploadListingMedia: React.FC<{
	listingPhotos: Array<string | null>;
	listingId: string;
	handleUpdate: (listing: Listing) => void;
	close: () => void;
}> = ({ listingPhotos = [], listingId, handleUpdate = () => {}, close }) => {
	const dispatch = useDispatch();
	return (
		<Box>
			<Grid container>
				{[0, 1, 2, 3, 4].map((position) => (
					<Grid item xs={6} sx={{ p: 1 }} key={position}>
						{listingPhotos[position] ? (
							<Box
								sx={{
									height: '150px',
									position: 'relative',
								}}
							>
								<img
									src={listingPhotos[position]!}
									alt="listing media"
									className="listing__media__image"
								/>
								<IconButton
									aria-label="delete image"
									sx={{
										position: 'absolute',
										top: -8,
										right: -8,
										background: 'white',
										p: 0.2,
										':hover': {
											background: 'white',
										},
									}}
									onClick={async () => {
										try {
											const res = await deleteListingImage(
												listingId,
												position + 1
											);
											if (!res.listing) throw new Error();
											handleUpdate(res.listing);
											dispatch(successAlert('Image removed successfully'));
										} catch (err) {
											let error = 'Unexpected error occurred';
											if (typeof handleError(err) === 'string')
												error = handleError(err);
											dispatch(errorAlert(error));
										}
									}}
								>
									<CancelRoundedIcon />
								</IconButton>
							</Box>
						) : (
							<UploadImageBtn
								position={position + 1}
								listingId={listingId}
								handleUpdate={handleUpdate}
							/>
						)}
					</Grid>
				))}
			</Grid>
			<Stack justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
				<Button type="button" variant="contained" onClick={close}>
					Done
				</Button>
			</Stack>
		</Box>
	);
};

export default UploadListingMedia;
